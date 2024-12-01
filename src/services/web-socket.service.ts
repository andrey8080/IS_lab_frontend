import * as Stomp from 'stompjs';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class WebSocketService {

	private stompClient!: Stomp.Client;
	private messageSubject = new Subject<any>();

	constructor() {}

	connect() {
		const socket = new WebSocket('ws://localhost:8080/ws');

		this.stompClient = Stomp.over(socket);

		// @ts-ignore
		this.stompClient.connect(
			{},
			(frame: Stomp.Frame) => {
				this.stompClient.send("/app/subscribe", {}, JSON.stringify({ message: "Подписываюсь на обновления" }));
				this.stompClient.subscribe('/topic/updates', (message) => {
					this.messageSubject.next(message.body);
				});
			},
			(error: Stomp.Frame | string) => {
				console.error('Error: ', error);
			}
		);
	}

	sendMessage(message: string): void {
		if (this.stompClient.connected) {
			this.stompClient.send('/app/updates', {}, message);
		} else {
			console.error('WebSocket не подключен');
		}
	}

	getMessages() {
		return this.messageSubject.asObservable();
	}

	disconnect(): void {
		if (this.stompClient && this.stompClient.connected) {
			this.stompClient.disconnect(() => {
				console.log('Соединение WebSocket закрыто');
			});
		}
	}
}
