import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

  getUser(id: number): Observable<User> {
    return this.httpClient.get<User>(`/api/users/${id}`);
  }

  addNewUser(newUser: User): Observable<number> {
    return this.httpClient.post(`/api/users`, newUser).pipe(map(response => response['id']));
  }
}
