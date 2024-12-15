import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Chapter} from '../models/space-marine.model';
import {environment} from '../../environment';

@Injectable({
	providedIn: 'root',
})
export class ChapterService {
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
		return this.http.post<Chapter[]>(`${environment.apiUrl}/chapter/getAll`, null, {headers: this.getHeaders()});
	}

	add(formData: any): Observable<any> {
		return this.http.post(`${environment.apiUrl}/chapter/add`, formData, {headers: this.getHeaders()});
	}

	delete(chapterId: number, options: { deleteSpaceMarines?: boolean; newChapterId?: number }): Observable<any> {
		const params: any = {};

		if (options.deleteSpaceMarines !== undefined) {
			params.deleteSpaceMarines = options.deleteSpaceMarines.toString();
		}
		if (options.newChapterId !== undefined) {
			params.newChapterId = options.newChapterId.toString();
		}

		return this.http.delete(`${environment.apiUrl}/chapter/delete/${chapterId}`, {
			headers: this.getHeaders(),
			params: params
		});
	}
}
