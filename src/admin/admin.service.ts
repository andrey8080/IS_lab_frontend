import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environment';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
	private apiUrl = `${environment.apiUrl}`;

	constructor(private http: HttpClient) {
	}

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('authToken');
		return new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		});
	}

	signup(adminRequestData: any): Observable<any> {
		const headers = new HttpHeaders({'Content-Type': 'application/json'});
		return this.http.post(`${this.apiUrl}/admin/signup`, adminRequestData, {headers});
	}

	getPendingApplications(token: string): Observable<any[]> {
		return this.http.post<any[]>(`${this.apiUrl}/admin/admin-requests`, {}, {headers: this.getHeaders()});
	}

	approveApplication(username: string, isApproved: boolean): Observable<void> {
		return this.http.post<void>(`${this.apiUrl}/admin/approve-admin`, {username, reason: '', isApproved}, {headers: this.getHeaders()});
	}
}
