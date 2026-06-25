using com.portfolio.requesthub as db from '../db/schema';

service RequestService {
  entity Requests as projection on db.Requests actions {
    action submit() returns Requests

  }
}