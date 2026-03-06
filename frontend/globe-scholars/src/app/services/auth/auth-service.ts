import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment.development'
import {NewUser, UserAccount, Tokens} from './interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn: boolean = false

  constructor(private http: HttpClient) {
  }

  protected authURL = `${environment.baseURL}/auth`
  public user: UserAccount | null = null;

  register(params: NewUser): Observable<UserAccount> {
    return this.http.post<UserAccount>(`${this.authURL}/signup/`, params)
  }

  login(username: string | null, password: string | null): Observable<UserAccount> {
    const params = {username, password}
    return this.http.post<UserAccount>(`${this.authURL}/login/`, params).pipe(
      tap((response: UserAccount) => {
        this.setToken(response.tokens);
        this.isLoggedIn = true;
      })
    )
  }

  setToken(tokens: Tokens): void {
    sessionStorage.setItem('access_token', tokens.access);
    sessionStorage.setItem('refresh_token', tokens.refresh);
  }
}
