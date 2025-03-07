import tkinter as tk
from tkinter import messagebox, Menu
import threading
import queue
import json
import os
from datetime import datetime

from login_uyap import open_browser_and_login
from search_all_files import search_all_files
from search_all_files_extract import extract_data_from_table

class UYAPApp:
    def __init__(self, root):
        self.root = root
        self.root.title("UYAP Automation App")
        self.root.geometry("800x500")

        # Connection state
        self.is_connected = False
        self.driver = None
        self.all_data = {}  # Store all extracted data
        self.current_row = None  # Track the selected row for context menu
        self.current_page = 0
        self.rows_per_page = 10
        self.table_data = []
        self.update_queue = queue.Queue()  # Queue for live updates
        self.max_rows = 10  # Fixed number of rows in the table

        # PIN Kodu Input
        self.pin_label = tk.Label(root, text="Enter PIN Kodu:")
        self.pin_label.pack(pady=5)

        self.pin_entry = tk.Entry(root)
        self.pin_entry.pack(pady=5)

        # Connect/Disconnect Button
        self.connect_button = tk.Button(root, text="Connect", command=self.toggle_connect)
        self.connect_button.pack(pady=5)

        # Search All Files Button
        self.search_all_button = tk.Button(root, text="Search All Files", command=self.start_search_all, state="disabled")
        self.search_all_button.pack(pady=5)

        # Extract Data Button
        self.extract_button = tk.Button(root, text="Extract Data", command=self.start_extract_data, state="disabled")
        self.extract_button.pack(pady=5)

        # Fixed-size table container
        self.table_container = tk.Frame(root)
        self.table_container.pack(pady=10)

        # Calculate table height: header + 10 rows (assuming each row is ~28 pixels tall to fit content)
        row_height = 28  # Adjusted for tighter fit
        table_height = row_height * (self.max_rows + 1)  # 11 rows total (10 data + 1 header)

        # Table Frame with fixed size and darker grey background
        self.table_frame = tk.Frame(self.table_container, width=700, height=table_height, bg="#333333")
        self.table_frame.pack_propagate(False)  # Prevent resizing
        self.table_frame.pack(pady=0)  # No padding to eliminate gap
        self.table_frame.bind("<Button-2>", lambda e: self.log_click("Middle", e))  # Middle-click for context menu

        # Pre-create headers with consistent alignment, darker grey background, and bold text
        headers = ["Nr", "Dosya No", "Birim", "Dosya Türü", "Dosya Durumu", "Dosya Açılış Tarihi"]
        header_frame = tk.Frame(self.table_frame, bg="#333333")
        header_frame.pack(fill=tk.X)
        for col, header in enumerate(headers):
            width = 5 if header == "Nr" else 15
            tk.Label(header_frame, text=header, borderwidth=1, relief="solid", width=width, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1, padx=1, pady=1, font=("Helvetica", 10, "bold")).grid(row=0, column=col, sticky="nsew")
            header_frame.grid_columnconfigure(col, weight=1, uniform="table")

        # Pre-create 10 data rows with darker grey background and white grid
        self.data_frames = []
        self.label_rows = []  # Store all labels for hover binding
        for i in range(self.max_rows):
            row_frame = tk.Frame(self.table_frame, bg="#333333")
            row_frame.pack(fill=tk.X)
            row_frame.bind("<Button-2>", lambda e, r=i: self.log_click("Middle", e, r))
            labels = [
                tk.Label(row_frame, text="", borderwidth=1, relief="solid", width=5, padx=1, pady=1, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1),
                tk.Label(row_frame, text="", borderwidth=1, relief="solid", width=15, padx=1, pady=1, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1),
                tk.Label(row_frame, text="", borderwidth=1, relief="solid", width=15, padx=1, pady=1, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1),
                tk.Label(row_frame, text="", borderwidth=1, relief="solid", width=15, padx=1, pady=1, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1),
                tk.Label(row_frame, text="", borderwidth=1, relief="solid", width=15, padx=1, pady=1, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1),
                tk.Label(row_frame, text="", borderwidth=1, relief="solid", width=15, padx=1, pady=1, bg="#333333", fg="white", highlightbackground="white", highlightcolor="white", highlightthickness=1)
            ]
            for col, label in enumerate(labels):
                label.grid(row=0, column=col, sticky="nsew")
                row_frame.grid_columnconfigure(col, weight=1, uniform="table")
                label.bind("<Button-2>", lambda e, r=i: self.log_click("Middle", e, r))
                label.bind("<Enter>", lambda e, r=i: self.highlight_row(r, True))
                label.bind("<Leave>", lambda e, r=i: self.highlight_row(r, False))
            self.data_frames.append(labels)
            self.label_rows.append(labels)

        # Add root-level binding for middle-click
        self.root.bind("<Button-2>", lambda e: self.log_click("Middle", e, root_level=True))

        # Force focus and grab events
        self.root.focus_set()
        self.root.grab_set()

        # Pagination Frame with visible buttons, no gap
        self.pagination_frame = tk.Frame(root, bg="gray", bd=2, relief="raised")
        self.pagination_frame.pack(pady=0, padx=10, fill=tk.X)  # No top padding to eliminate gap
        self.prev_button = tk.Button(self.pagination_frame, text="Previous", command=self.prev_page, state="disabled", bg="white", fg="black", font=("Helvetica", 10), width=10, height=2)
        self.prev_button.pack(side=tk.LEFT, padx=10, pady=5)
        self.next_button = tk.Button(self.pagination_frame, text="Next", command=self.next_page, state="disabled", bg="white", fg="black", font=("Helvetica", 10), width=10, height=2)
        self.next_button.pack(side=tk.LEFT, padx=10, pady=5)

        # Result Label
        self.result_label = tk.Label(root, text="")
        self.result_label.pack(pady=5)

        # Setup context menu
        self.context_menu = Menu(self.root, tearoff=0)
        self.context_menu.add_command(label="Dosya Bilgileri", command=self.show_dosya_bilgileri)
        self.context_menu.add_command(label="Dosya Hesabı", command=self.show_dosya_hesabi)
        self.context_menu.add_command(label="Taraf Bilgileri", command=self.show_taraf_bilgileri)

        # Detailed data window (initially hidden)
        self.detail_window = None

        # Load local data on startup
        self.load_local_data()

        # Start UI update loop
        self.root.after(100, self.process_queue)

    def log_click(self, button_type, event, row_idx=None, root_level=False):
        """Handle middle-click to show context menu (no logging)."""
        # Use Middle-click to trigger context menu
        if button_type == "Middle" and row_idx is not None and not root_level:
            self.show_context_menu(event, row_idx)

    def load_local_data(self):
        """Load data from the local JSON file if it exists for today."""
        output_dir = "/Users/ugurulger/Desktop/extracted_data"
        today_date = datetime.now().strftime("%Y%m%d")  # Format: YYYYMMDD (e.g., 20250307)
        output_file = os.path.join(output_dir, f"extracted_data_{today_date}.json")

        if os.path.exists(output_file):
            if os.path.getsize(output_file) == 0:
                return  # Skip empty file without error
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    local_data = json.load(f)
                self.all_data.update(local_data)
                # Populate table_data with Genel data
                for row_key, row_data in local_data.items():
                    if "Genel" in row_data:
                        row_num = int(row_key.replace("row", ""))
                        self.table_data.append((row_num, row_data["Genel"]))
                self.update_table()
            except json.JSONDecodeError as e:
                messagebox.showwarning("Warning", f"Invalid JSON data in {output_file}: {e}. Skipping load.")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load local data from {output_file}: {e}")
        else:
            pass  # No file found, proceed without error

    def highlight_row(self, row_idx, highlight):
        """Highlight or unhighlight a row on hover."""
        if 0 <= row_idx < len(self.label_rows):
            for label in self.label_rows[row_idx]:
                label.config(bg="gray" if highlight else "#333333")

    def toggle_connect(self):
        if not self.is_connected:
            self.connect()
        else:
            self.disconnect()

    def connect(self):
        pinkodu = self.pin_entry.get()
        if not pinkodu:
            self.result_label.config(text="Please enter PIN Kodu.")
            return

        self.result_label.config(text="Logging in to UYAP...")
        self.connect_button.config(state="disabled")
        threading.Thread(target=self.connect_thread, args=(pinkodu,), daemon=True).start()

    def connect_thread(self, pinkodu):
        try:
            driver = open_browser_and_login(pinkodu, self.result_label)
            if driver:
                self.driver = driver
                self.is_connected = True
                self.root.after(0, lambda: self.result_label.config(text="Connected"))
                self.root.after(0, lambda: self.connect_button.config(text="Disconnect", state="normal"))
                self.root.after(0, lambda: self.search_all_button.config(state="normal"))
                self.root.after(0, lambda: self.extract_button.config(state="normal"))
            else:
                self.root.after(0, lambda: self.connect_button.config(state="normal"))
        except Exception as e:
            self.root.after(0, lambda: self.result_label.config(text=f"Error: {e}"))
            self.root.after(0, lambda: messagebox.showerror("Error", f"An error occurred: {e}"))
            self.root.after(0, lambda: self.connect_button.config(state="normal"))

    def disconnect(self):
        if self.driver:
            self.driver.quit()
            self.driver = None
        self.is_connected = False
        self.result_label.config(text="Disconnected")
        self.connect_button.config(text="Connect")
        self.search_all_button.config(state="disabled")
        self.extract_button.config(state="disabled")
        self.clear_table()  # Clear table on disconnect
        self.all_data.clear()  # Clear stored data
        self.current_page = 0
        self.table_data = []

    def start_search_all(self):
        if not self.is_connected or not self.driver:
            self.result_label.config(text="Please connect to UYAP first.")
            return
        try:
            search_all_files(self.driver, self.result_label)
        except Exception as e:
            self.result_label.config(text=f"Search all files error: {e}")
            messagebox.showerror("Error", f"Search all files failed: {e}")

    def start_extract_data(self):
        if not self.is_connected or not self.driver:
            self.result_label.config(text="Please connect to UYAP first.")
            return
        try:
            self.result_label.config(text="Extracting data from table...")
            self.clear_table()
            extract_thread = threading.Thread(target=self.extract_data_thread, daemon=True)
            extract_thread.start()
        except Exception as e:
            self.result_label.config(text=f"Extract data error: {e}")
            messagebox.showerror("Error", f"Data extraction failed: {e}")

    def extract_data_thread(self):
        try:
            extract_data_from_table(self.driver, self.queue_update_ui)
            self.root.after(0, lambda: self.result_label.config(text="Data extraction completed."))
            self.root.after(0, self.update_table)  # Update table after extraction
        except Exception as e:
            self.root.after(0, lambda e=e: self.result_label.config(text=f"Extract data error: {e}"))
            self.root.after(0, lambda e=e: messagebox.showerror("Error", f"Data extraction failed: {e}"))

    def queue_update_ui(self, row_num, genel_data):
        """Queue update for UI thread safety."""
        self.update_queue.put((row_num, genel_data))

    def process_queue(self):
        """Process queued updates in the main thread."""
        while not self.update_queue.empty():
            row_num, genel_data = self.update_queue.get()
            self.update_ui_with_row(row_num, genel_data)
        self.root.after(100, self.process_queue)

    def update_ui_with_row(self, row_num, genel_data):
        """Update UI with new row's Genel data."""
        row_key = f"row{row_num}"
        self.all_data[row_key] = {"Genel": genel_data}  # Store minimal data
        self.table_data.append((row_num, genel_data))
        self.update_table()  # Update table immediately

    def clear_table(self):
        """Clear the table display."""
        self.current_page = 0
        self.table_data = []
        self.update_table()

    def update_table(self):
        """Update the table display for the current page."""
        # Clear existing data in pre-created rows
        for labels in self.data_frames:
            for label in labels:
                label.config(text="", bg="#333333", fg="white")

        # Fill data for current page
        start_idx = self.current_page * self.rows_per_page
        end_idx = min((self.current_page + 1) * self.rows_per_page, len(self.table_data))
        for i, (row_num, genel_data) in enumerate(self.table_data[start_idx:end_idx], start=start_idx):
            row_idx = i - start_idx  # Adjust for 0-based index in data_frames
            if row_idx < self.max_rows:  # Ensure we don't exceed pre-created rows
                self.data_frames[row_idx][0].config(text=str(i + 1))  # Nr starts from 1 based on position
                self.data_frames[row_idx][1].config(text=genel_data["Dosya No"])
                self.data_frames[row_idx][2].config(text=genel_data["Birim"])
                self.data_frames[row_idx][3].config(text=genel_data["Dosya Türü"])
                self.data_frames[row_idx][4].config(text=genel_data["Dosya Durumu"])
                self.data_frames[row_idx][5].config(text=genel_data["Dosya Açılış Tarihi"])

        # Update pagination buttons
        total_pages = (len(self.table_data) + self.rows_per_page - 1) // self.rows_per_page
        self.prev_button.config(state="normal" if self.current_page > 0 else "disabled")
        self.next_button.config(state="normal" if self.current_page < total_pages - 1 else "disabled")

    def prev_page(self):
        if self.current_page > 0:
            self.current_page -= 1
            self.update_table()

    def next_page(self):
        total_pages = (len(self.table_data) + self.rows_per_page - 1) // self.rows_per_page
        if self.current_page < total_pages - 1:
            self.current_page += 1
            self.update_table()

    def show_context_menu(self, event, row_idx):
        """Display context menu on middle-click."""
        if 0 <= row_idx < self.max_rows and (self.current_page * self.rows_per_page + row_idx) < len(self.table_data):
            self.current_row = self.current_page * self.rows_per_page + row_idx
            self.context_menu.post(event.x_root, event.y_root)

    def show_dosya_bilgileri(self):
        self.show_detail_table("Dosya Bilgileri")

    def show_dosya_hesabi(self):
        self.show_detail_table("Dosya Hesabı")

    def show_taraf_bilgileri(self):
        self.show_detail_table("Taraf Bilgileri")

    def show_detail_table(self, section):
        if self.current_row is None or self.current_row >= len(self.all_data):
            return

        row_key = f"row{self.current_row + 1}"
        if row_key not in self.all_data:
            messagebox.showwarning("Warning", "Data not fully loaded for this row yet.")
            return

        data = self.all_data[row_key].get(section, {})
        if not data:
            messagebox.showinfo("Info", f"No {section} data available for this row.")
            return

        if self.detail_window:
            self.detail_window.destroy()
        self.detail_window = tk.Toplevel(self.root)
        self.detail_window.title(f"{section} for Row {self.current_row + 1}")
        self.detail_window.geometry("600x400")

        table_frame = tk.Frame(self.detail_window)
        table_frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

        if section in ["Dosya Bilgileri", "Dosya Hesabı"]:
            # Display each key-value pair in a row with two columns, bold headers
            for row, (key, value) in enumerate(data.items(), start=0):
                tk.Label(table_frame, text=key, borderwidth=1, relief="solid", width=15, anchor="e", font=("Helvetica", 10, "bold")).grid(row=row, column=0, padx=1, pady=1, sticky="e")
                tk.Label(table_frame, text=value, borderwidth=1, relief="solid", width=25, anchor="w").grid(row=row, column=1, padx=1, pady=1, sticky="w")
        elif section == "Taraf Bilgileri" and isinstance(list(data.values())[0] if data else {}, dict):
            headers = ["Taraf"] + list(next(iter(data.values())).keys()) if data else []
            for col, header in enumerate(headers):
                tk.Label(table_frame, text=header, borderwidth=1, relief="solid", width=15).grid(row=0, column=col, padx=1, pady=1)
            for row, (taraf, details) in enumerate(data.items(), start=1):
                tk.Label(table_frame, text=taraf, borderwidth=1, relief="solid", width=15).grid(row=row, column=0, padx=1, pady=1)
                for col, value in enumerate(details.values(), start=1):
                    tk.Label(table_frame, text=value, borderwidth=1, relief="solid", width=15).grid(row=row, column=col, padx=1, pady=1)
        else:
            for row, value in enumerate(data.values(), start=0):
                tk.Label(table_frame, text=value, borderwidth=1, relief="solid", width=15).grid(row=row, column=0, padx=1, pady=1)

# Create and run GUI
root = tk.Tk()
app = UYAPApp(root)
root.mainloop()