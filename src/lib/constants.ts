export const ID_LABELS: Record<string, string> = {
  aadhaar:         'Aadhaar Card',
  pan:             'PAN Card',
  passport:        'Passport',
  driving_license: 'Driving Licence',
  voter_id:        'Voter ID',
  other:           'Other',
};

export const ID_TYPES = [
  { value: 'aadhaar',         label: 'Aadhaar Card'    },
  { value: 'pan',             label: 'PAN Card'         },
  { value: 'passport',        label: 'Passport'         },
  { value: 'driving_license', label: 'Driving Licence'  },
  { value: 'voter_id',        label: 'Voter ID'         },
  { value: 'other',           label: 'Other'            },
] as const;
