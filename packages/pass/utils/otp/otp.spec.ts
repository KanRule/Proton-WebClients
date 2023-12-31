import { parseOTPValue } from './otp';

const toOtpUri = (secret: string) =>
    `otpauth://totp/Proton%20Pass?secret=${secret.split(' ').join('')}&algorithm=SHA1&digits=6&period=30`;

describe('otp parser', () => {
    test('should parse raw base32 secrets', () => {
        [
            'NMC2NUFEYUEBIT4U',
            'O45BF7XCIMXYH4WH',
            'TWIG6UVT3UVHF4PW',
            '3AX6HCBFHX2LQKYP',
            '4GSMRELZ3ZUCJKTW',
            'HHHLHJJZQQMNEFII',
            'HEW7OP7ASXHW7YEQ',
            'ETOVQFNIWOQWWV6V',
        ].forEach((secret) => expect(parseOTPValue(secret)).toEqual(toOtpUri(secret)));
    });

    test('should parse base32 secrets with spaces', () => {
        [
            'NMC2 NUFE YUEB IT4U',
            'O45B F7XC IMXY H4WH',
            'TWIG 6UVT 3UVH F4PW',
            '3AX6 HCBF HX2L QKYP',
            '4GSM RELZ 3ZUC JKTW',
            'HHHL HJJZ QQMN EFII',
            'HEW7 OP7A SXHW 7YEQ',
            'ETOV QFNI WOQW WV6V',
        ].forEach((secret) => expect(parseOTPValue(secret)).toEqual(toOtpUri(secret)));
    });

    test('should fail on invalid base32 secrets', () => {
        [
            '1MC2NUFEYUEBIT4U',
            '845BF7XCIMXYH4WH',
            '9WIG6UVT3UVHF4PW',
            '1AX6HCBFHX2LQKYP',
            '8GSMRELZ3ZUCJKTW',
            '9HHLHJJZQQMNEFII',
            '0EW7OP7ASXHW7YEQ',
            '1TOVQFNIWOQWWV6V',
        ].forEach((secret) => expect(parseOTPValue(secret)).toEqual(''));
    });

    test('should parse OTP urls following the spec', () => {
        [
            toOtpUri('NMC2 NUFE YUEB IT4U'),
            toOtpUri('O45B F7XC IMXY H4WH'),
            toOtpUri('TWIG 6UVT 3UVH F4PW'),
            toOtpUri('3AX6 HCBF HX2L QKYP'),
            toOtpUri('4GSM RELZ 3ZUC JKTW'),
            toOtpUri('HHHL HJJZ QQMN EFII'),
            toOtpUri('HEW7 OP7A SXHW 7YEQ'),
            toOtpUri('ETOV QFNI WOQW WV6V'),
        ].forEach((url) => expect(parseOTPValue(url)).toEqual(url));
    });

    test('should handle incomplete OTP urls', () => {
        [
            [
                /* missing otp auth label */
                'otpauth://totp?secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=60',
                'otpauth://totp/Proton%20Pass?secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=60',
            ],
            [
                /* only secret */
                'otpauth://totp?secret=QWERTZUIOPASDFGH',
                'otpauth://totp/Proton%20Pass?secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=30',
            ],
        ].forEach(([uri, expected]) => expect(parseOTPValue(uri)).toEqual(expected));
    });

    test('should fail on invalid OTP URIs', () => {
        [
            'otp://totp?secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=60',
            'otpauth:totp?secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=60',
            'otpauth://totp?secret=QWERTZUIOPA1DFGH&algorithm=SHA1&digits=6&period=60',
        ].forEach((uri) => expect(parseOTPValue(uri)).toEqual(''));
    });

    test('should hydrate label & issuer', () => {
        expect(
            parseOTPValue('otpauth://totp?secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=30', {
                label: 'TestLabel',
                issuer: 'TestIssuer',
            })
        ).toEqual(
            'otpauth://totp/TestIssuer:TestLabel?issuer=TestIssuer&secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=30'
        );

        expect(
            parseOTPValue('QWERTZUIOPASDFGH', {
                label: 'TestLabel',
                issuer: 'TestIssuer',
            })
        ).toEqual(
            'otpauth://totp/TestIssuer:TestLabel?issuer=TestIssuer&secret=QWERTZUIOPASDFGH&algorithm=SHA1&digits=6&period=30'
        );
    });
});
