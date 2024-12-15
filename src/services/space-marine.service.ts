import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {SpaceMarine} from '../models/space-marine.model';
import {WebSocketSubject} from 'rxjs/webSocket';
import {environment} from '../../environment';

@Injectable({
	providedIn: 'root',
})
export class SpaceMarineService {
	private socket: WebSocketSubject<any>;

	constructor(private http: HttpClient) {
		this.socket = new WebSocketSubject({
			url: `${environment.socketUrl}`,
			openObserver: {
				next: () => console.log('WebSocket connection established')
			},
			closeObserver: {
				next: () => console.log('WebSocket connection closed')
			}
		});
	}

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('authToken');
		return new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		});
	}

	getAllSpaceMarines(): Observable<SpaceMarine[]> {
		return this.http.post<SpaceMarine[]>(`${environment.apiUrl}/space-marine/all-objects`, null, {headers: this.getHeaders()});
	}

	getUserSpaceMarines(): Observable<SpaceMarine[]> {
		return this.http.post<SpaceMarine[]>(`${environment.apiUrl}/space-marine/user-objects`, null, {headers: this.getHeaders()});
	}

	getSpaceMarinesUpdates(): Observable<SpaceMarine[]> {
		return this.socket.asObservable();
	}

	getSpaceMarineById(id: number): Observable<any> {
		return this.http.post(`${environment.apiUrl}/space-marine/get/${id}`, null, {headers: this.getHeaders()});
	}

	add(formData: any): Observable<any> {
		return this.http.post(`${environment.apiUrl}/space-marine/add`, formData, {headers: this.getHeaders()}).pipe(
			tap(() => {
				this.socket.next('add');
			})
		);
	}

	updateSpaceMarine(id: number | null, formData: any): Observable<any> {
		return this.http.put(`${environment.apiUrl}/space-marine/update/${id}`, formData, {headers: this.getHeaders()}).pipe(
			tap(() => {
				this.socket.next('update');
			})
		);
	}

	delete(id: number): Observable<any> {
		return this.http.delete(`${environment.apiUrl}/space-marine/delete/${id}`, {headers: this.getHeaders()}).pipe(
			tap(() => {
				this.socket.next('delete');
			})
		);
	}
}
