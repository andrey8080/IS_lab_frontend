import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Chapter} from '../models/space-marine.model';

@Injectable({
	providedIn: 'root',
})
export class ChapterService {
	private baseUrl = 'http://localhost:8080/chapter';

	constructor(private http: HttpClient) {
	}

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('authToken');
		return new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		});
	}

	getChapters(): Observable<Chapter[]> {
		return this.http.post<Chapter[]>(`${this.baseUrl}/getAll`, null, {headers: this.getHeaders()});
	}

	add(formData: any): Observable<any> {
		return this.http.post(`${this.baseUrl}/add`, formData, {headers: this.getHeaders()});
	}

	delete(chapterId: number, options: { deleteSpaceMarines?: boolean; newChapterId?: number }): Observable<any> {
		const params: any = {};

		if (options.deleteSpaceMarines !== undefined) {
			params.deleteSpaceMarines = options.deleteSpaceMarines.toString();
		}
		if (options.newChapterId !== undefined) {
			params.newChapterId = options.newChapterId.toString();
		}

		return this.http.delete(`${this.baseUrl}/delete/${chapterId}`, {
			headers: this.getHeaders(),
			params: params
		});
	}
}
