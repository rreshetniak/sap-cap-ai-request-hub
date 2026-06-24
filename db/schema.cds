namespace com.portfolio.requesthub;

using { 
  cuid, 
  managed 
  } from '@sap/cds/common';

  @cds.autoexpose
  entity RequestTypes {
    key code      : String(50);
    name          : String(100);
    description   : String(255);
  }

  @cds.autoexpose
  entity RequestPriorities {
    key code      : String(20);
    name          : String(100);
    description   : String(255);
  }

  @cds.autoexpose
  entity RequestStatuses {
    key code      : String(30);
    name          : String(100);
    description   : String(255);
  }

  entity Requests : cuid, managed {
    @mandatory
    @mandatory.message: 'A request title is required.'
    title         : String(255);
    
    description   : LargeString;

    requestType   : Association to RequestTypes;
    priority      : Association to RequestPriorities;
    status        : Association to RequestStatuses;

    aiSummary     : LargeString;
  }