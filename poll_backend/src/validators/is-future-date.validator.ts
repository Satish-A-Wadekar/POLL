import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: Date, args: ValidationArguments) {
    return date > new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return 'Expiry date must be in the future';
  }
}
