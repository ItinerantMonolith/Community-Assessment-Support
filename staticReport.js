const CB_BASE_URL = 'https://api.census.gov/data/'
const CB_DATASET = '/acs/acs5?get='
// const CB_API_KEY =  process.env.CB_API_KEY
CB_API_KEY = '&key=00032a8653c1b9fb53c830c4c2537cdb4e637e5f'
const CB_STATIC_BASE = 'https://data.census.gov/cedsci/table?q='
const CB_STATIC_SET = '&tid=ACSDT5Y2018.'

const ZIP_URL = 'https://api.zippopotam.us/US/'

// state codes are fixed. the USCB API is looking for these two character ID's for the states.
const STATES = [
   { name: 'Alabama', id: '01' },
   { name: 'Alaska', id: '02' },
   { name: 'Arizona', id: '04' },
   { name: 'Arkansas', id: '05' },
   { name: 'California', id: '06' },
   { name: 'Colorado', id: '08' },
   { name: 'Connecticut', id: '09' },
   { name: 'Delaware', id: '10' },
   { name: 'District of Columbia', id: '11' },
   { name: 'Florida', id: '12' },
   { name: 'Georgia', id: '13' },
   { name: 'Hawaii', id: '15' },
   { name: 'Idaho', id: '16' },
   { name: 'Illinois', id: '17' },
   { name: 'Indiana', id: '18' },
   { name: 'Iowa', id: '19' },
   { name: 'Kansas', id: '20' },
   { name: 'Kentucky', id: '21' },
   { name: 'Louisiana', id: '22' },
   { name: 'Maine', id: '23' },
   { name: 'Maryland', id: '24' },
   { name: 'Massachusetts', id: '25' },
   { name: 'Michigan', id: '26' },
   { name: 'Minnesota', id: '27' },
   { name: 'Mississippi', id: '28' },
   { name: 'Missouri', id: '29' },
   { name: 'Montana', id: '30' },
   { name: 'Nebraska', id: '31' },
   { name: 'Nevada', id: '32' },
   { name: 'New Hampshire', id: '33' },
   { name: 'New Jersey', id: '34' },
   { name: 'New Mexico', id: '35' },
   { name: 'New York', id: '36' },
   { name: 'North Carolina', id: '37' },
   { name: 'North Dakota', id: '38' },
   { name: 'Ohio', id: '39' },
   { name: 'Oklahoma', id: '40' },
   { name: 'Oregon', id: '41' },
   { name: 'Pennsylvania', id: '42' },
   { name: 'Rhode Island', id: '44' },
   { name: 'South Carolina', id: '45' },
   { name: 'South Dakota', id: '46' },
   { name: 'Tennessee', id: '47' },
   { name: 'Texas', id: '48' },
   { name: 'Utah', id: '49' },
   { name: 'Vermont', id: '50' },
   { name: 'Virginia', id: '51' },
   { name: 'West Virginia', id: '54' },
   { name: 'Washington', id: '53' },
   { name: 'Wisconsin', id: '55' },
   { name: 'Wyoming', id: '56' },
   { name: 'Puerto Rico', id: '72' },
]

const REPORTS_RAW = [
   {
      name: 'Population by Geographic Area and Year',
      fields: [{ name: 'Population', code: 'B01003_001E', type: 'number' }],
      isTrend: true,
   },
   {
      name: 'Poverty Rate by Geographic Area and Year',
      fields: [
         {
            name: 'Percent Below Poverty Rate',
            code: 'B17001_002E,B17001_001E',
            type: 'percent',
         },
      ],
      isTrend: true,
   },
   {
      name: 'Ethnicity as a Percentage of the Population by Geographic Area',
      fields: [
         {
            name: 'Hispanic or Latino Origin (of any race)',
            code: 'B03001_003E,B03001_001E',
            type: 'percent',
         },
         {
            name: 'Hispanic or Latino Origin: Mexican',
            code: 'B03001_004E,B03001_001E',
            type: 'percent',
         },
         {
            name: 'Hispanic or Latino Origin: Puerto Rican',
            code: 'B03001_005E,B03001_001E',
            type: 'percent',
         },
         {
            name: 'Hispanic or Latino Origin: Cuban',
            code: 'B03001_006E,B03001_001E',
            type: 'percent',
         },
         {
            name: 'Hispanic or Latino Origin: Other',
            code: 'B03001_007E,B03001_008E,B03001_016E,B03001_027E,B03001_001E',
            type: 'percent',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Foreign-Born Population by Geographic Area',
      fields: [
         {
            name: 'Percent Foreign-Born',
            code: 'B05002_013E,B05002_001E',
            type: 'sumPct',
         },
         {
            name: 'Percent of Foreign-Born Population that is a non-US Citizen',
            code: 'B05002_021E,B05002_013E',
            type: 'sumPct',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Language Spoken at Home (5 Years and Over) by Geographic Area',
      fields: [
         {
            name: 'English',
            code: 'B16007_003E,B16007_009E,B16007_015E,B16007_001E',
            type: 'percent',
         },
         {
            name: 'Spanish',
            code: 'B16007_004E,B16007_010E,B16007_016E,B16007_001E',
            type: 'percent',
         },
         {
            name: 'Other Indo-European',
            code: 'B16007_005E,B16007_011E,B16007_017E,B16007_001E',
            type: 'percent',
         },
         {
            name: 'Asian and Pacific Islander',
            code: 'B16007_006E,B16007_012E,B16007_018E,B16007_001E',
            type: 'percent',
         },
         {
            name: 'Other',
            code: 'B16007_007E,B16007_013E,B16007_019E,B16007_001E',
            type: 'percent',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Median Age and Distribution of the Population by Geographic Area',
      fields: [
         { name: 'Median Age', code: 'B01002_001E', type: 'decimal' },
         {
            name: 'Percent of Population under Age 5',
            code: 'B01001_003E,B01001_027E,B01001_001E',
            type: 'percent',
         },
         {
            name: 'Percent of Population under Over Age 65',
            code:
               'B01001_020E,B01001_021E,B01001_022E,B01001_023E,B01001_024E,B01001_025E,B01001_044E,B01001_045E,B01001_046E,B01001_047E,B01001_048E,B01001_049E,B01001_001E',
            type: 'percent',
         },
      ],
      isTrend: false,
   },
   {
      name:
         'Number (and Percent) of Individuals Below Poverty Level by Race and Geographic Area',
      fields: [
         { name: 'White', code: 'B17001A_002E,B17001A_001E', type: 'sumPct' },
         {
            name: 'Black or African American',
            code: 'B17001B_002E,B17001B_001E',
            type: 'sumPct',
         },
         {
            name: 'American Indian & Alaskan Native',
            code: 'B17001C_002E,B17001C_001E',
            type: 'sumPct',
         },
         { name: 'Asian', code: 'B17001D_002E,B17001D_001E', type: 'sumPct' },
         {
            name: 'Native Hawaiian or Other Pacific Islander',
            code: 'B17001E_002E,B17001E_001E',
            type: 'sumPct',
         },
         {
            name: 'Some other race',
            code: 'B17001F_002E,B17001F_001E',
            type: 'sumPct',
         },
         {
            name: 'Two or more races',
            code: 'B17001G_002E,B17001G_001E',
            type: 'sumPct',
         },
      ],
      isTrend: false,
   },
   {
      name:
         'Population (and Percentage of Population) by Race and Geographic Area',
      fields: [
         {
            name: 'White (percent)',
            code: 'B02001_002E,B02001_001E',
            type: 'sumPct',
         },
         {
            name: 'Black or African American (percent)',
            code: 'B02001_003E,B02001_001E',
            type: 'sumPct',
         },
         {
            name: 'American Indian and Alaskan Native (percent)',
            code: 'B02001_004E,B02001_001E',
            type: 'sumPct',
         },
         {
            name: 'Asian (percent)',
            code: 'B02001_005E,B02001_001E',
            type: 'sumPct',
         },
         {
            name: 'Native Hawaiian & Other Pacific Islander (percent)',
            code: 'B02001_006E,B02001_001E',
            type: 'sumPct',
         },
         {
            name: 'Some other race (percent)',
            code: 'B02001_007E,B02001_001E',
            type: 'sumPct',
         },
         {
            name: 'Two or more races (percent)',
            code: 'B02001_008E,B02001_001E',
            type: 'sumPct',
         },
      ],
      isTrend: false,
   },
   {
      name:
         'Number (and percent) of Individuals Below Poverty Level by Ethnicity and Geographic Area',
      fields: [
         {
            name: 'Hispanic or Latino Origin',
            code: 'B17001I_002E,B17001I_001E',
            type: 'sumPct',
         },
         {
            name: 'Non-Hispanic or Latino Origin, White Alone',
            code: 'B17001H_002E,B17001H_001E',
            type: 'sumPct',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Poverty Rate by Family Status and Geographic Area',
      fields: [
         {
            name: 'All Familes with Related Children Under Age 5',
            code:
               'B17010_005E,B17010_012E,B17010_018E,B17010_025E,B17010_032E,B17010_038E',
            type: 'percent',
            numeratorCnt: 3,
         },
         {
            name: 'Married-couple Families with Related Children Under Age 5',
            code: 'B17010_005E,B17010_025E',
            type: 'percent',
            numeratorCnt: 1,
         },
         {
            name:
               'Families with Female Householder, No Spouse Present, with Related Children Under Age 5',
            code: 'B17010_018E,B17010_038E',
            type: 'percent',
            numeratorCnt: 1,
         },
      ],
      isTrend: false,
   },
   {
      name:
         'Percentage of Children (ages 0 to 18 years old) by Relationship to Householder and Geographic Area',
      fields: [
         {
            name: 'Own Child (biological, step, or adopted)',
            code: 'B09018_002E,B09018_001E',
            type: 'percent',
         },
         {
            name: 'Grandchild',
            code: 'B09018_006E,B09018_001E',
            type: 'percent',
         },
         {
            name: 'Other Relatives',
            code: 'B09018_007E,B09018_001E',
            type: 'percent',
         },
         {
            name: 'Foster child or other unrelated child',
            code: 'B09018_008E,B09018_001E',
            type: 'percent',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Children Under Age 5, Child Poverty by Geographic Area',
      fields: [
         {
            name: 'Child Poverty (0-18)',
            code:
               'B17001_004E,B17001_005E,B17001_006E,B17001_007E,B17001_008E,B17001_009E,B17001_018E,B17001_019E,B17001_020E,B17001_021E,B17001_022E,B17001_023E,B17001_033E,B17001_034E,B17001_035E,B17001_036E,B17001_037E,B17001_038E,B17001_047E,B17001_048E,B17001_049E,B17001_050E,B17001_051E,B17001_052E',
            type: 'percent',
            numeratorCnt: 12,
         },
         {
            name: 'Poverty Rate for Children <5 Years Old',
            code: 'B17001_004E,B17001_018E,B17001_033E,B17001_047E',
            type: 'percent',
            numeratorCnt: 2,
         },
         {
            name: 'Number of Children <5 Years Old',
            code: 'B17001_004E,B17001_018E,B17001_033E,B17001_047E',
            type: 'sum',
         },
         {
            name: 'Number of Children <5 Years Old Living in Poverty',
            code: 'B17001_004E,B17001_018E',
            type: 'sum',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Number of Children <5 Years Old Living in Poverty',
      fields: [
         { name: 'Population', code: 'B17001_004E,B17001_018E', type: 'sum' },
      ],
      isTrend: true,
   },
   {
      name: 'Education Attainment (Age 25 and over)',
      fields: [
         {
            name: 'Less Than 9th Grade',
            code:
               'B15003_002E,B15003_003E,B15003_004E,B15003_005E,B15003_006E,B15003_007E,B15003_008E,B15003_009E,B15003_010E,B15003_011E,B15003_012E,B15003_001E',
            type: 'percent',
         },
         {
            name: '9th to 12th Grade, no diploma',
            code: 'B15003_013E,B15003_014E,B15003_015E,B15003_016E,B15003_001E',
            type: 'percent',
         },
         {
            name: 'High school graduate',
            code: 'B15003_017E,B15003_018E,B15003_001E',
            type: 'percent',
         },
         {
            name: 'Some college, no degree',
            code: 'B15003_019E,B15003_020E,B15003_001E',
            type: 'percent',
         },
         {
            name: "Associate's degree",
            code: 'B15003_021E,B15003_001E',
            type: 'percent',
         },
         {
            name: "Bachelor's degree",
            code: 'B15003_022E,B15003_001E',
            type: 'percent',
         },
         {
            name: 'Advanced degree',
            code: 'B15003_023E,B15003_024E,B15003_025E,B15003_001E',
            type: 'percent',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Median Home Value and Costs by Geographic Area',
      fields: [
         {
            name: 'Median Home Value',
            code: 'B25077_001E',
            type: 'dollars',
         },
         {
            name: 'Median Owner Costs',
            code: 'B25088_002E',
            type: 'dollars',
         },
         {
            name: 'Median Rent',
            code: 'B25064_001E',
            type: 'dollars',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Housing Characteristics',
      fields: [
         {
            name: 'Rental Vacancy Rate',
            code: 'B25004_002E,B25004_003E,B25003_003E',
            type: 'percent',
            numeratorCnt: 1,
         },
          {
             name: 'Households Spending 30% or More or Monthly Income on Rent',
             code: 'B25070_007E,B25070_008E,B25070_009E,B25070_010E,B25070_002E,B25070_003E,B25070_004E,B25070_005E,B25070_006E',
             type: 'percent',
             numeratorCnt: 4,
          },
         {
            name: 'Percent of Households with No Vehicle Available',
            code: 'B25044_003E,B25044_010E,B25044_001E',
            type: 'percent',
         },
      ],
      isTrend: false,
   },
   {
      name: 'Percent of Population in Labor Force by Subgroup and Geography',
      fields: [
         {
            name: 'Population Age 16+',
            code: 'B23025_002E,B23025_001E',
            type: 'percent',
         },
         {
             name: 'Households with Children Under Age 6, All Parents in Family in Labor Force',
             code: 'B23008_004E,B23008_010E,B23008_013E,B23008_002E',
             type: 'percent'
         }
      ],
      isTrend: false,
   },
   {
       name: 'Number of Employed Individuals (Age 16+) and Percentage of the Employed Workforce by Class of Worker and Geographic Area',
       fields: [
           {
               name: 'Private wage and salary workders',
               code: 'B24080_003E,B24080_006E,B24080_013E,B24080_016E,B24080_001E',
               type: 'sumPct'
           },
           {
               name: 'Government Workders',
               code: 'B24080_007E,B24080_008E,B24080_009E,B24080_017E,B24080_018E,B24080_019E,B24080_001E',
               type: 'sumPct'
           },
           {
            name: 'Self-employed in own not incorporated business workers',
            code: 'B24080_010E,B24080_020E,B24080_001E',
            type: 'sumPct'
        },
        {
            name: 'Unpaid family workders',
            code: 'B24080_011E,B24080_021E,B24080_001E',
            type: 'sumPct'
        }       
       ],
       isTrend: false
   },
//    {
//        name: 'Number of Employed Individuals (Age 16+) and Percentage of the Employed Workforce by Occupation and Geographic Area',
//        fields: [
//             {
//                 name: 'Management, business, science, and arts occupations',
//                 code: 'B24020_001E,B24020_002E',
//                 type: 'sum'
//             },
//             {
//                 name: 'Service occupations',
//                 code: 'B24010_064E,B24010_215E',
//                 type: 'sum'
//             },

//        ],
//        isTrend: false
//    },
   {
       name: 'Households with No Vehicle Available',
       fields: [
           {
               name: 'Percent of Households with No Vehicle Available',
               code: 'B25044_003E,B25044_010E,B25044_001E',
               type: 'percent',
           }
       ],
       isTrend: false
   },
   {
       name: 'Mean Travel Time to Work',
       fields: [
           { 
               name: 'Minutes',
               code: 'B08013_001E,B08011_001E',
               type: 'decCalc'
           }
       ],
       isTrend: false
   },
   {
       name: 'Median Household Income',
       fields: [
           {
               name: 'Median Household Income',
               code: 'B19013_001E',
               type: 'dollars'
           }
       ],
       isTrend: false
   },
   {
       name: 'Transportation to Work by Geographic Area',
       fields: [
           {
               name: 'Car, truck, or van - drove alone',
               code: 'B08006_003E,B08006_001E',
               type: 'percent'
           },
           {
            name: 'Car, truck, or van - carpooled',
            code: 'B08006_004E,B08006_001E',
            type: 'percent'
        },
        {
            name: 'Public Transportation',
            code: 'B08006_008E,B08006_001E',
            type: 'percent'
        },
        {
            name: 'Walked',
            code: 'B08006_015E,B08006_001E',
            type: 'percent'
        },
        {
            name: 'Other Means',
            code: 'B08006_014E,B08006_016E,B08006_001E',
            type: 'percent'
        },
        {
            name: 'Worked from home',
            code: 'B08006_017E,B08006_001E',
            type: 'percent'
        }
       ],
       isTrend: false
   }
]

const REPORTS = REPORTS_RAW.sort((a, b) => (a.name < b.name ? -1 : 1))
