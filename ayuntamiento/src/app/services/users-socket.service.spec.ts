import { TestBed } from '@angular/core/testing';

import { UsersSocketService } from './users-socket.service';

describe('UsersSocketService', () => {
  let service: UsersSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
