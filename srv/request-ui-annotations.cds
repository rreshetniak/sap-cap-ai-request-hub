using RequestService as service from './request-service';

annotate service.Requests with {
  ID @title: 'Request ID';
  title @title: 'Title';
  description @title: 'Description';
  businessPartnerId @title: 'Business Partner';
  assignedProcessorId @title: 'Assigned Processor';
  requestType @title: 'Request Type';
  priority @title: 'Priority';
  status @title: 'Status';
  aiSummary @title: 'AI Summary';
  createdAt @title: 'Created At';
  createdBy @title: 'Created By';
  modifiedAt @title: 'Changed At';
  modifiedBy @title: 'Changed By';
};

annotate service.Requests with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Request',
      TypeNamePlural: 'Requests',
      Title: {
        Value: title,
      },
      Description: {
        Value: status.name,
      },
    },
    
    SelectionFields: [
      status,
      requestType,
      priority,
      createdBy,
      assignedProcessorId
    ],

    LineItem: [
      {Value: title, Label: 'Title'},
      {Value: requestType.name, Label: 'Type'},
      {Value: priority.name, Label: 'Priority'},
      {Value: status.name, Label: 'Status'},
      {Value: assignedProcessorId, Label: 'Assigned Processor'},
      {Value: modifiedAt, Label: 'Changed At'}
    ],

    Identification: [
      {Value: title, Label: 'Title'},
      {Value: description, Label: 'Description'},
      {Value: status.name, Label: 'Status'},
      {Value: requestType.name, Label: 'Request Type'},
      {Value: priority.name, Label: 'Priority'},
      {Value: businessPartnerId, Label: 'Business Partner'},
      {Value: assignedProcessorId, Label: 'Assigned Processor'}
    ],

    FieldGroup #General: {
      Data: [
        {Value: title, Label: 'Title'},
        {Value: description, Label: 'Description'},
        {Value: businessPartnerId, Label: 'Business Partner'}
      ]
    },

    FieldGroup #Processing: {
      Data: [
        {Value: status.name, Label: 'Status'},
        {Value: requestType.name, Label: 'Request Type'},
        {Value: priority.name, Label: 'Priority'},
        {Value: assignedProcessorId, Label: 'Assigned Processor'}
      ]
    },

    FieldGroup #Audit: {
      Data: [
        {Value: createdAt, Label: 'Created At'},
        {Value: createdBy, Label: 'Created By'},
        {Value: modifiedAt, Label: 'Changed At'},
        {Value: modifiedBy, Label: 'Changed By'}
      ]
    },

    Facets: [
      {
        $Type: 'UI.ReferenceFacet',
        ID: 'General',
        Label: 'General',
        Target: '@UI.FieldGroup#General',
      },
      {
        $Type: 'UI.ReferenceFacet',
        ID: 'Processing',
        Label: 'Processing',
        Target: '@UI.FieldGroup#Processing',
      },
      {
        $Type: 'UI.ReferenceFacet',
        ID: 'Audit',
        Label: 'Audit',
        Target: '@UI.FieldGroup#Audit',
      }
    ]
  }
);

annotate service.RequestTypes with @(
  cds.odata.valuelist
);

annotate service.RequestPriorities with @(
  cds.odata.valuelist
);

annotate service.RequestStatuses with @(
  cds.odata.valuelist
);  

