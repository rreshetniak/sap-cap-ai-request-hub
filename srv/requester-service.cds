using com.portfolio.requesthub as db from '../db/schema';

@path: '/requester'
@requires: ['Requester', 'Admin']
service RequesterService {
  @restrict: [
    {grant: 'READ', to: 'Requester', where: (createdBy = $user)},
    {grant: 'READ', to: 'Admin'}
  ]
  entity Requests as projection on db.Requests {
    ID,
    createdAt,
    createdBy,
    title,
    description,
    businessPartnerId,
    requestType,
    priority,
    status,
    aiSummary,
    comments
  };
}
