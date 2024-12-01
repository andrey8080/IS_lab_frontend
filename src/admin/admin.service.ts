import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AdminService {
	private adminUrl = 'http://localhost:8080/admin';
	private authUrl = 'http://localhost:8080/auth';

	constructor(private http: HttpClient) {
	}

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('authToken');
		return new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		});
	}

	login(username: string, password: string): Observable<any> {
		const headers = new HttpHeaders({'Content-Type': 'application/json'});
		return this.http.post(`${this.authUrl}/signin`, {name: username, password}, {headers});
	}

	signup(formData: any, adminRequestData: any): Observable<any> {
		const headers = new HttpHeaders({'Content-Type': 'application/json'});
		return this.http.post(`${this.authUrl}/signup`, {formData, adminRequestData}, {headers});
	}

	getPendingApplications(token: string): Observable<any[]> {
		return this.http.post<any[]>(`${this.adminUrl}/admin-requests`, {}, {headers: this.getHeaders()});
	}

	approveApplication(username: string, token: string): Observable<void> {
		return this.http.post<void>(`${this.adminUrl}/approve-admin`, {username}, {headers: this.getHeaders()});
	}
}
