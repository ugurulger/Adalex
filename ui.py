import tkinter as tk
from tkinter import messagebox
import threading
from login_uyap import open_browser_and_login
from search_all_files import search_all_files
from search_all_files_extract import extract_data_from_table  # Import for the new button

class UYAPApp:
    def __init__(self, root):
        self.root = root
        self.root.title("UYAP Automation App")
        self.root.geometry("400x250")

        # Connection state
        self.is_connected = False
        self.driver = None

        # PIN Kodu Input
        self.pin_label = tk.Label(root, text="Enter PIN Kodu:")
        self.pin_label.pack(pady=5)

        self.pin_entry = tk.Entry(root)
        self.pin_entry.pack(pady=5)

        # Connect/Disconnect Button
        self.connect_button = tk.Button(root, text="Connect", command=self.toggle_connect)
        self.connect_button.pack(pady=5)

        # Search All Files Button (disabled by default until connected)
        self.search_all_button = tk.Button(root, text="Search All Files", command=self.start_search_all, state="disabled")
        self.search_all_button.pack(pady=5)

        # New Extract Data Button (disabled by default until connected)
        self.extract_button = tk.Button(root, text="Extract Data", command=self.start_extract_data, state="disabled")
        self.extract_button.pack(pady=5)

        # Result Label
        self.result_label = tk.Label(root, text="")
        self.result_label.pack(pady=5)

    def toggle_connect(self):
        if not self.is_connected:
            self.connect()
        else:
            self.disconnect()

    def connect(self):
        # Get PIN Kodu from the UI
        pinkodu = self.pin_entry.get()

        # Validate input
        if not pinkodu:
            self.result_label.config(text="Please enter PIN Kodu.")
            return

        # Update UI status before starting login
        self.result_label.config(text="Logging in to UYAP...")
        self.connect_button.config(state="disabled")  # Disable button during login

        # Start the login process in a new thread
        threading.Thread(target=self.connect_thread, args=(pinkodu,), daemon=True).start()

    def connect_thread(self, pinkodu):
        try:
            driver = open_browser_and_login(pinkodu, self.result_label)
            if driver:  # Successful login
                self.driver = driver
                self.is_connected = True
                # Update the UI in the main thread
                self.root.after(0, lambda: self.result_label.config(text="Connected"))
                self.root.after(0, lambda: self.connect_button.config(text="Disconnect", state="normal"))
                self.root.after(0, lambda: self.search_all_button.config(state="normal"))
                self.root.after(0, lambda: self.extract_button.config(state="normal"))  # Enable new button
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
        self.search_all_button.config(state="disabled")  # Disable Search All Files button
        self.extract_button.config(state="disabled")  # Disable Extract Data button

    def start_search_all(self):
        if not self.is_connected or not self.driver:
            self.result_label.config(text="Please connect to UYAP first.")
            return

        # Call the search_all_files function
        try:
            search_all_files(self.driver, self.result_label)
        except Exception as e:
            self.result_label.config(text=f"Search all files error: {e}")
            messagebox.showerror("Error", f"Search all files failed: {e}")

    def start_extract_data(self):
        if not self.is_connected or not self.driver:
            self.result_label.config(text="Please connect to UYAP first.")
            return

        # Call the extract_data_from_table function
        try:
            self.result_label.config(text="Extracting data from table...")
            extract_data_from_table(self.driver)
            self.result_label.config(text="Data extraction completed.")
        except Exception as e:
            self.result_label.config(text=f"Extract data error: {e}")
            messagebox.showerror("Error", f"Data extraction failed: {e}")

# Create and run GUI
root = tk.Tk()
app = UYAPApp(root)
root.mainloop()