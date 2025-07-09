export interface UYAPLoginRequest {
  pin_kodu: string;
}

export interface UYAPLogoutRequest {
  session_id: string;
}

export interface UYAPSearchFilesRequest {
  session_id: string;
}

export interface UYAPExtractDataRequest {
  session_id: string;
}

export interface UYAPQueryRequest {
  session_id: string;
  dosya_no: string;
  selected_options: string[];
}

export interface UYAPResponse {
  success: boolean;
  message: string;
  session_id?: string;
  data?: any;
  result?: any;
  active_sessions?: string[];
  total_sessions?: number;
}

class UYAPService {
  private baseUrl = '/api/uyap';

  async login(pin_kodu: string): Promise<UYAPResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        pin_kodu,
      }),
    });

    return response.json();
  }

  async logout(session_id: string): Promise<UYAPResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'logout',
        session_id,
      }),
    });

    return response.json();
  }

  async searchFiles(session_id: string): Promise<UYAPResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search-files',
        session_id,
      }),
    });

    return response.json();
  }

  async extractData(session_id: string): Promise<UYAPResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'extract-data',
        session_id,
      }),
    });

    return response.json();
  }

  async query(session_id: string, dosya_no: string, selected_options: string[]): Promise<UYAPResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'query',
        session_id,
        dosya_no,
        selected_options,
      }),
    });

    return response.json();
  }

  async getStatus(): Promise<UYAPResponse> {
    const response = await fetch(`${this.baseUrl}?action=status`);
    return response.json();
  }
}

export const uyapService = new UYAPService(); 