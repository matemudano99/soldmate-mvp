package com.soldmate.company;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class NifCifValidator {

    private static final Pattern NIF_PATTERN =
        Pattern.compile("^[XYZ0-9]\\d{7}[A-Z]$", Pattern.CASE_INSENSITIVE);
    private static final Pattern CIF_PATTERN =
        Pattern.compile("^[ABCDEFGHJKLMNPQRSUVW]\\d{7}[0-9A-J]$", Pattern.CASE_INSENSITIVE);
    private static final String NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

    public boolean isValid(String taxId, String country) {
        if (taxId == null || taxId.isBlank()) return false;
        if (!"ES".equalsIgnoreCase(country)) return true;

        String id = taxId.trim().toUpperCase();
        if (NIF_PATTERN.matcher(id).matches()) return isValidNif(id);
        if (CIF_PATTERN.matcher(id).matches()) return isValidCif(id);
        return false;
    }

    private boolean isValidNif(String nif) {
        String digits = nif.substring(0, 8)
            .replace('X', '0').replace('Y', '1').replace('Z', '2');
        try {
            int number = Integer.parseInt(digits);
            return nif.charAt(8) == NIF_LETTERS.charAt(number % 23);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private boolean isValidCif(String cif) {
        String digits = cif.substring(1, 8);
        char   control = cif.charAt(8);
        int sumOdd = 0, sumEven = 0;
        for (int i = 0; i < digits.length(); i++) {
            int d = Character.getNumericValue(digits.charAt(i));
            if (i % 2 == 0) { d *= 2; if (d > 9) d -= 9; sumOdd += d; }
            else { sumEven += d; }
        }
        int lastDigit = (10 - ((sumOdd + sumEven) % 10)) % 10;
        char letterControl = (char)('A' + lastDigit - 1);
        return control == ('0' + lastDigit) || control == letterControl;
    }
}
