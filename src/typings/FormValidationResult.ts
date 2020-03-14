import { IValidationResult } from './IValidationResult';

export interface FormValidationResultModel {
    valid?: boolean;
    messages?: string[];
    validationResults?: IValidationResult[];
}

export class FormValidationResult implements FormValidationResultModel {
    public valid?: boolean;
    public messages?: string[];
    public validationResults?: IValidationResult[];

    constructor(value?: FormValidationResultModel) {
        this.valid = value ? value.valid : false;
        this.messages = value ? value.messages : [];
        this.validationResults = value ? value.validationResults : [];

        this.initalizeResult();
    }

    private initalizeResult() {
        if (this.validationResults && this.validationResults.length > 0) {
            this.valid = true;
            this.validationResults.forEach(v => {
                this.valid = this.valid && v.valid;
                if (!v.valid) {
                    this.messages.push(v.message);
                }
            });
        }
    }
}
