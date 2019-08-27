import Validator from './validator';

const USERNAME_MIN_LENGTH = 3;
const DISPLAYNAME_MIN_LENGTH = 3;
const PASSWORD_LENGTH = 4;

export const signUpFormValidator = {
    /**
     * 비밀번호 유효성 검사를 실행합니다.
     * @param {string} password
     */
    validatePassword(password) {
        if (!password || password.length === 0) {
            return {
                valid: false,
                message: 'Please input your current password.',
            };
        }

        if (password.length < PASSWORD_LENGTH) {
            return {
                valid: false,
                message: `Please input your password more than ${PASSWORD_LENGTH} characters.`,
            };
        }

        return {
            valid: true,
            message: '',
        };
    },

    checkEmail(formValues) {
        const { email } = formValues;
        if (!email || email.trim().length === 0) {
            return {
                valid: false,
                message: 'Please input your email address',
            };
        }

        if (!Validator.email(email)) {
            return {
                valid: false,
                message: 'Please input a valid formatted email address',
            };
        }

        return {
            valid: true,
            message: '',
        };
    },
    checkPassword(formValues) {
        const { password } = formValues;

        return this.validatePassword(password.trim());
    },
    checkPasswordConfirm(formValues) {
        const { password, passwordConfirm } = formValues;

        const result = this.validatePassword(passwordConfirm.trim());

        if (!result.valid) {
            return result;
        }

        if (password.trim() !== passwordConfirm.trim()) {
            return {
                valid: false,
                message: 'Please input same as password.',
            };
        }

        return {
            valid: true,
            message: '',
        };
    },

    checkUsername(formValues) {
        const { username } = formValues;
        if (!username || username.trim().length === 0) {
            return {
                valid: false,
                message: 'Please input your username',
            };
        }

        if (!/^[a-z][a-z0-9_-]+[a-z0-9]$/i.test(username)) {
            return {
                valid: false,
                message:
                    'Please input your username with combining alphabet (lower-case), number, dash(-) and underscore(_). It should start with alphabet character. and it should end with alphabet or number character.',
            };
        }

        if (username.trim().length < USERNAME_MIN_LENGTH) {
            return {
                valid: false,
                message: `Please input your user name longer than ${USERNAME_MIN_LENGTH}`,
            };
        }

        return {
            valid: true,
            message: '',
        };
    },

    checkDisplayName(formValues) {
        const { displayName } = formValues;

        if (!displayName || displayName.trim().length === 0) {
            return {
                valid: false,
                message: 'Please input your display name.',
            };
        }

        if (displayName.trim().length < DISPLAYNAME_MIN_LENGTH) {
            return {
                valid: false,
                message: `Please input your display name longer than ${DISPLAYNAME_MIN_LENGTH}`,
            };
        }

        return {
            valid: true,
            message: '',
        };
    },

    validate(formValues) {
        const results = [];

        results.push(this.checkEmail(formValues));
        results.push(this.checkPassword(formValues));
        results.push(this.checkPasswordConfirm(formValues));
        results.push(this.checkUsername(formValues));
        results.push(this.checkDisplayName(formValues));

        let valid = true;
        const messages = [];
        results.forEach(v => {
            valid = valid && v.valid;
            if (!v.valid) {
                messages.push(v.message);
            }
        });

        return {
            valid: valid,
            messages: messages,
        };
    },
};
