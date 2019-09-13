import { IValidationResult } from './IValidationResult';
export interface IFormValidationResult {
    valid?: boolean;
    messages?: string[];
    validationResults?: IValidationResult[];
}
