using RequestService as service from '../../srv/request-service';
using from '../../srv/request-ui-annotations';

annotate service.Requests with @(
    UI.FieldGroup #General : {
        Data : [
            {
                $Type : 'UI.DataField',
                Value : title,
                Label : 'Title',
            },
            {
                $Type : 'UI.DataField',
                Value : description,
                Label : 'Description',
            },
            {
                $Type : 'UI.DataField',
                Value : businessPartnerId,
                Label : 'Business Partner',
            },
            {
                $Type : 'UI.DataField',
                Value : aiSummary,
            },
        ],
    }
);