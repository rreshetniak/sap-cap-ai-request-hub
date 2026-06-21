namespace com.portfolio.requesthub;

using { 
  cuid, 
  managed 
  } from '@sap/cds/common';

  entity Requests : cuid, managed {
    title         : String(255);
    description   : LargeString;
    requestType   : String(50);
    priority      : String(20);
    status        : String(30);
    aiSummary     : LargeString;
  }