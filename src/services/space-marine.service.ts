import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {SpaceMarine} from '../models/space-marine.model';
import {WebSocketSubject} from 'rxjs/webSocket';

@Injectable({
	providedIn: 'root',
})
export class SpaceMarineService {
	private baseUrl = 'http://localhost:8080/space-marine';
	private socket: WebSocketSubject<any>;

	constructor(private http: HttpClient) {
		this.socket = new WebSocketSubject({
			url: 'ws://localhost:8080/ws',
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
		return this.http.post<SpaceMarine[]>(`${this.baseUrl}/all-objects`, null, {headers: this.getHeaders()});
	}

	getUserSpaceMarines(): Observable<SpaceMarine[]> {
		return this.http.post<SpaceMarine[]>(`${this.baseUrl}/user-objects`, null, {headers: this.getHeaders()});
	}

	getSpaceMarinesUpdates(): Observable<SpaceMarine[]> {
		return this.socket.asObservable();
	}

	getSpaceMarineById(id: number): Observable<any> {
		return this.http.post(`${this.baseUrl}/get/${id}`, null, {headers: this.getHeaders()});
	}

	add(formData: any): Observable<any> {
		return this.http.post(`${this.baseUrl}/add`, formData, {headers: this.getHeaders()}).pipe(
			tap(() => {
				this.socket.next('add');
			})
		);
	}

	updateSpaceMarine(id: number | null, formData: any): Observable<any> {
		return this.http.put(`${this.baseUrl}/update/${id}`, formData, {headers: this.getHeaders()}).pipe(
			tap(() => {
				this.socket.next('update');
			})
		);
	}

	delete(id: number): Observable<any> {
		return this.http.delete(`${this.baseUrl}/delete/${id}`, {headers: this.getHeaders()}).pipe(
			tap(() => {
				this.socket.next('delete');
			})
		);
	}
}
