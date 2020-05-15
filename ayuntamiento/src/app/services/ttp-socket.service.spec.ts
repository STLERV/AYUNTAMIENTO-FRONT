import { TestBed } from '@angular/core/testing';

import { TtpSocketService } from './ttp-socket.service';

describe('TtpSocketService', () => {
  let service: TtpSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TtpSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
