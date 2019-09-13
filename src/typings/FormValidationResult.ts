import { IValidationResult } from './IValidationResult';
import { IFormValidationResult } from './IFormValidationResult';
export class FormValidationResult implements IFormValidationResult {
    public valid?: boolean;
    public messages?: string[];
    public validationResults?: IValidationResult[];

    constructor(value?: IFormValidationResult) {
        this.valid = value ? value.valid : false;
        this.messages = value ? value.messages : [];
        this.validationResults = value ? value.validationResults : [];

        this.initalizeResult();
    }

    private initalizeResult() {
        if (this.validationResults && this.validationResults.length > 0) {
            this.valid = true;
            this.validationResults.forEach((v) => {
                this.valid = this.valid && v.valid;
                if (!v.valid) {
                    this.messages.push(v.message);
                }
            });
        }
    }
}
