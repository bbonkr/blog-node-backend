import { Validator } from './validator';
import { IValidationResult } from '../typings/IValidationResult';
import { ValidationResult } from '../typings/ValidationResult';
import { FormValidationResult } from '../typings/FormValidationResult';
import { SignUpFormOptions } from '../typings/SignUpFormOptions';

export const USERNAME_MIN_LENGTH = 3;
export const DISPLAYNAME_MIN_LENGTH = 3;
export const PASSWORD_LENGTH = 4;

export class SignUpFormValidator {
    /**
     * 비밀번호 유효성 검사를 실행합니다.
     * @param {string} password
     */
    public validatePassword(password: string): IValidationResult {
        if (!password || password.length === 0) {
            return new ValidationResult({
                valid: false,
                message: 'Please input your current password.',
            });
        }

        if (password.length < PASSWORD_LENGTH) {
            return new ValidationResult({
                valid: false,
                message: `Please input your password more than ${PASSWORD_LENGTH} characters.`,
            });
        }

        return ValidationResult.ValidResult;
    }

    /**
     * 전자우편주소 유효성 검사
     * @param formValues
     */
    public checkEmail(formValues: SignUpFormOptions): IValidationResult {
        const { email } = formValues;
        if (!email || email.trim().length === 0) {
            return new ValidationResult({
                valid: false,
                message: 'Please input your email address',
            });
        }

        if (!Validator.email(email)) {
            return new ValidationResult({
                valid: false,
                message: 'Please input a valid formatted email address',
            });
        }

        return ValidationResult.ValidResult;
    }

    /**
     * 비밀번호 유효성 검사
     * @param formValues
     */
    public checkPassword(formValues: SignUpFormOptions): IValidationResult {
        const { password } = formValues;

        return this.validatePassword(password.trim());
    }

    /**
     * 비밀번호 확인 유효성 검사
     * @param formValues
     */
    public checkPasswordConfirm(formValues: SignUpFormOptions): IValidationResult {
        const { password, passwordConfirm } = formValues;

        const result = this.validatePassword(passwordConfirm.trim());

        if (!result.valid) {
            return result;
        }

        if (password.trim() !== passwordConfirm.trim()) {
            return new ValidationResult({
                valid: false,
                message: 'Please input same as password.',
            });
        }

        return ValidationResult.ValidResult;
    }

    /**
     * 계정이름 유효성 검사
     * @param formValues
     */
    public checkUsername(formValues: SignUpFormOptions): IValidationResult {
        const { username } = formValues;
        if (!username || username.trim().length === 0) {
            return new ValidationResult({
                valid: false,
                message: 'Please input your username',
            });
        }

        if (!/^[a-z][a-z0-9_-]+[a-z0-9]$/i.test(username)) {
            return new ValidationResult({
                valid: false,
                message:
                    'Please input your username with combining alphabet (lower-case), number, dash(-) and underscore(_). It should start with alphabet character. and it should end with alphabet or number character.',
            });
        }

        if (username.trim().length < USERNAME_MIN_LENGTH) {
            return new ValidationResult({
                valid: false,
                message: `Please input your user name longer than ${USERNAME_MIN_LENGTH}`,
            });
        }

        return ValidationResult.ValidResult;
    }

    /**
     * 출력 이름 유효성 검사
     * @param formValues
     */
    public checkDisplayName(formValues: SignUpFormOptions): IValidationResult {
        const { displayName } = formValues;

        if (!displayName || displayName.trim().length === 0) {
            return new ValidationResult({
                valid: false,
                message: 'Please input your display name.',
            });
        }

        if (displayName.trim().length < DISPLAYNAME_MIN_LENGTH) {
            return new ValidationResult({
                valid: false,
                message: `Please input your display name longer than ${DISPLAYNAME_MIN_LENGTH}`,
            });
        }

        return ValidationResult.ValidResult;
    }

    /**
     * 폼 입력값의 유효성 검사를 실행합니다.
     * @param formValues
     */
    public validate(formValues: SignUpFormOptions): FormValidationResult {
        const results: IValidationResult[] = [];

        results.push(this.checkEmail(formValues));
        results.push(this.checkPassword(formValues));
        results.push(this.checkPasswordConfirm(formValues));
        results.push(this.checkUsername(formValues));
        results.push(this.checkDisplayName(formValues));

        return new FormValidationResult({
            validationResults: results,
        });
    }
}
