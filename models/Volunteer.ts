import { Document, Schema } from 'mongoose';
import config from '../config';
import UserModel, { User } from './User';

export enum SUBJECTS {
  PREALGREBA = 'prealgebra',
  ALGREBA = 'algebra',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  CALCULUS = 'calculus',
  INTEGRATED_MATH_ONE = 'integratedMathOne',
  INTEGRATED_MATH_TWO = 'integratedMathTwo',
  INTEGRATED_MATH_THREE = 'integratedMathThree',
  INTEGRATED_MATH_FOUR = 'integratedMathFour',
  APPLICATIONS = 'applications',
  ESSAYS = 'essays',
  PLANNING = 'planning',
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne'
}

export enum DAYS {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday'
}

export enum HOURS {
  '12AM' = '12a',
  '1AM' = '1a',
  '2AM' = '2a',
  '3AM' = '3a',
  '4AM' = '4a',
  '5AM' = '5a',
  '6AM' = '6a',
  '7AM' = '7a',
  '8AM' = '8a',
  '9AM' = '9a',
  '10AM' = '10a',
  '11AM' = '11a',
  '12PM' = '12p',
  '1PM' = '1p',
  '2PM' = '2p',
  '3PM' = '3p',
  '4PM' = '4p',
  '5PM' = '5p',
  '6PM' = '6p',
  '7PM' = '7p',
  '8PM' = '8p',
  '9PM' = '9p',
  '10PM' = '10p',
  '11PM' = '11p'
}

export type AvailabilityDay = {
  [hour in HOURS]: boolean;
};

export type Availability = {
  [day in DAYS]: AvailabilityDay;
};

export interface Volunteer extends User {
  registrationCode: string;
  volunteerPartnerOrg: string;
  isFailsafeVolunteer: boolean;
  phone: string;
  favoriteAcademicSubject: string;
  college: string;
  availability: Availability;
  timezone: string;
  availabilityLastModifiedAt: Date;
  elapsedAvailability: number;
  certifications: {
    [subject in SUBJECTS]: {
      passed: boolean;
      tries: number;
      lastAttemptedAt: Date;
    };
  };
}

export type VolunteerDocument = Volunteer & Document;

const weeksSince = (date): number => {
  // 604800000 = milliseconds in a week
  return ((new Date().getTime() as number) - date) / 604800000;
};

const minsSince = (date): number => {
  // 60000 = milliseconds in a minute
  return ((new Date().getTime() as number) - date) / 60000;
};

const tallyVolunteerPoints = (volunteer): number => {
  let points = 0;

  // +2 points if no past sessions
  if (!volunteer.pastSessions || !volunteer.pastSessions.length) {
    points += 2;
  }

  // +1 point if volunteer is from a partner org
  if (volunteer.volunteerPartnerOrg) {
    points += 1;
  }

  // +1 point per 1 week since last notification
  if (volunteer.volunteerLastNotification) {
    points += weeksSince(new Date(volunteer.volunteerLastNotification.sentAt));
  } else {
    points += weeksSince(new Date(volunteer.createdAt));
  }

  // +1 point per 2 weeks since last session
  if (volunteer.volunteerLastSession) {
    points +=
      0.5 * weeksSince(new Date(volunteer.volunteerLastSession.createdAt));
  } else {
    points += weeksSince(new Date(volunteer.createdAt));
  }

  // -10000 points if notified recently
  if (
    volunteer.volunteerLastNotification &&
    minsSince(new Date(volunteer.volunteerLastNotification.sentAt)) < 5
  ) {
    points -= 10000;
  }

  return parseFloat(points.toFixed(2));
};

// subdocument schema for each availability day
const availabilityDaySchema = new Schema(
  {
    [HOURS['12AM']]: { type: Boolean, default: false },
    [HOURS['1AM']]: { type: Boolean, default: false },
    [HOURS['2AM']]: { type: Boolean, default: false },
    [HOURS['3AM']]: { type: Boolean, default: false },
    [HOURS['4AM']]: { type: Boolean, default: false },
    [HOURS['5AM']]: { type: Boolean, default: false },
    [HOURS['6AM']]: { type: Boolean, default: false },
    [HOURS['7AM']]: { type: Boolean, default: false },
    [HOURS['8AM']]: { type: Boolean, default: false },
    [HOURS['9AM']]: { type: Boolean, default: false },
    [HOURS['10AM']]: { type: Boolean, default: false },
    [HOURS['11AM']]: { type: Boolean, default: false },
    [HOURS['12PM']]: { type: Boolean, default: false },
    [HOURS['1PM']]: { type: Boolean, default: false },
    [HOURS['2PM']]: { type: Boolean, default: false },
    [HOURS['3PM']]: { type: Boolean, default: false },
    [HOURS['4PM']]: { type: Boolean, default: false },
    [HOURS['5PM']]: { type: Boolean, default: false },
    [HOURS['6PM']]: { type: Boolean, default: false },
    [HOURS['7PM']]: { type: Boolean, default: false },
    [HOURS['8PM']]: { type: Boolean, default: false },
    [HOURS['9PM']]: { type: Boolean, default: false },
    [HOURS['10PM']]: { type: Boolean, default: false },
    [HOURS['11PM']]: { type: Boolean, default: false }
  },
  { _id: false }
);

const availabilitySchema = new Schema(
  {
    [DAYS.SUNDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.MONDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.TUESDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.WEDNESDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.THURSDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.FRIDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    },
    [DAYS.SATURDAY]: {
      type: availabilityDaySchema,
      default: availabilityDaySchema
    }
  },
  { _id: false }
);

const volunteerSchemaOptions = {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
};

const volunteerSchema = new Schema(
  {
    registrationCode: { type: String, select: false },
    volunteerPartnerOrg: String,
    isFailsafeVolunteer: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true,
      trim: true
      // @todo: server-side validation of international phone format
    },
    favoriteAcademicSubject: String,
    college: String,

    availability: {
      type: availabilitySchema,
      default: availabilitySchema
    },
    timezone: String,
    availabilityLastModifiedAt: { type: Date },
    elapsedAvailability: { type: Number, default: 0 },

    certifications: {
      [SUBJECTS.PREALGREBA]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.ALGREBA]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.GEOMETRY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.TRIGONOMETRY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.PRECALCULUS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.CALCULUS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_ONE]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_TWO]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_THREE]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.INTEGRATED_MATH_FOUR]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.APPLICATIONS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.ESSAYS]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.PLANNING]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.BIOLOGY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.CHEMISTRY]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      },
      [SUBJECTS.PHYSICS_ONE]: {
        passed: {
          type: Boolean,
          default: false
        },
        tries: {
          type: Number,
          default: 0
        },
        lastAttemptedAt: { type: Date }
      }
    }
  },
  volunteerSchemaOptions
);

volunteerSchema.virtual('volunteerPointRank').get(function() {
  if (!this.isVolunteer) return null;
  return tallyVolunteerPoints(this);
});

// Virtual that gets all notifications that this user has been sent
volunteerSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'volunteer',
  options: { sort: { sentAt: -1 } }
});

volunteerSchema.virtual('volunteerLastSession', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'volunteer',
  justOne: true,
  options: { sort: { createdAt: -1 } }
});

volunteerSchema.virtual('volunteerLastNotification', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'volunteer',
  justOne: true,
  options: { sort: { sentAt: -1 } }
});

volunteerSchema.virtual('isOnboarded').get(function() {
  if (!this.isVolunteer) return null;
  const certifications = this.certifications.toObject();
  let isCertified = false;

  for (const subject in certifications) {
    if (
      certifications.hasOwnProperty(subject) &&
      certifications[subject].passed
    ) {
      isCertified = true;
      break;
    }
  }

  return !!this.availabilityLastModifiedAt && isCertified;
});

// Static method to determine if a registration code is valid
volunteerSchema.statics.checkCode = function(code): boolean {
  const volunteerCodes = config.VOLUNTEER_CODES.split(',');

  const isVolunteerCode = volunteerCodes.some(volunteerCode => {
    return volunteerCode.toUpperCase() === code.toUpperCase();
  });

  return isVolunteerCode;
};

// Use the user schema as the base schema for Volunteer
const Volunteer = UserModel.discriminator<VolunteerDocument>(
  'Volunteer',
  volunteerSchema
);

module.exports = Volunteer;
export default Volunteer;
