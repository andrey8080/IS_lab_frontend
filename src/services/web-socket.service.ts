import { Client, Frame } from '@stomp/stompjs';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {environment} from '../../environment';

@Injectable({
	providedIn: 'root',
})
export class WebSocketService {
	private stompClient!: Client;
	private messageSubject = new Subject<any>();

	constructor() {}

	connect() {
		// this.stompClient = new Client({
		// 	brokerURL: `${environment.socketUrl}`,
		// 	debug: (str) => console.log(str),
		// 	reconnectDelay: 5000,
		// });
		//
		// this.stompClient.onConnect = (frame: Frame) => {
		// 	console.log('Connected: ', frame);
		// 	this.stompClient.subscribe('/topic/updates', (message) => {
		// 		this.messageSubject.next(message.body);
		// 	});
		// 	this.stompClient.publish({
		// 		destination: '/app/subscribe',
		// 		body: JSON.stringify({ message: 'Подписываюсь на обновления' }),
		// 	});
		// };
		//
		// this.stompClient.onStompError = (frame: Frame) => {
		// 	console.error('Broker reported error: ', frame.headers['message']);
		// 	console.error('Additional details: ', frame.body);
		// };
		//
		// this.stompClient.activate();
	}

	sendMessage(message: string): void {
		if (this.stompClient && this.stompClient.connected) {
			this.stompClient.publish({
				destination: '/app/updates',
				body: message,
			});
		} else {
			console.error('WebSocket не подключен');
		}
	}

	getMessages() {
		return this.messageSubject.asObservable();
	}

	disconnect(): void {
		if (this.stompClient && this.stompClient.connected) {
			this.stompClient.deactivate();
			console.log('Соединение WebSocket закрыто');
		}
	}
}
