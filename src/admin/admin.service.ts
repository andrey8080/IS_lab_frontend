import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
	private adminUrl = 'http://localhost:8080/admin';

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
		return this.http.post(`${this.adminUrl}/signup`, adminRequestData, {headers});
	}

	getPendingApplications(token: string): Observable<any[]> {
		return this.http.post<any[]>(`${this.adminUrl}/admin-requests`, {}, {headers: this.getHeaders()});
	}

	approveApplication(username: string, isApproved: boolean): Observable<void> {
		return this.http.post<void>(`${this.adminUrl}/approve-admin`, {username, reason: '', isApproved}, {headers: this.getHeaders()});
	}
}
