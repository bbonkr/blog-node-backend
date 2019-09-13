import { IValidationResult } from './IValidationResult';

export class ValidationResult implements IValidationResult {
    public static ValidResult: IValidationResult = new ValidationResult({
        valid: true,
        message: '',
    });
    public valid: boolean;
    public message?: string;
    constructor(value?: IValidationResult) {
        this.valid = value ? value.valid : false;
        this.message = value ? value.message : '';
    }
}
