const CB_BASE_URL = "https://api.census.gov/data/"
const CB_DATASET = "/acs/acs5?get="
// const CB_API_KEY =  process.env.CB_API_KEY
CB_API_KEY = "&key=00032a8653c1b9fb53c830c4c2537cdb4e637e5f"
const CB_STATIC_BASE = "https://data.census.gov/cedsci/table?q="
const CB_STATIC_SET = "&tid=ACSDT5Y2018."

const ZIP_URL = 'https://api.zippopotam.us/US/'

// state codes are fixed. the USCB API is looking for these two character ID's for the states.
const STATES = [ { name: 'Alabama', id: '01' }, { name: 'Alaska', id: '02' }, { name: 'Arizona', id: '04' }, { name: 'Arkansas', id: '05' }, { name: 'California', id: '06' }, { name: 'Colorado', id: '08' }, { name: 'Connecticut', id: '09' }, { name: 'Delaware', id: '10' }, { name: 'District of Columbia', id: '11' }, { name: 'Florida', id: '12' }, { name: 'Georgia', id: '13' }, { name: 'Idaho', id: '16' }, { name: 'Hawaii', id: '15' }, { name: 'Illinois', id: '17' }, { name: 'Indiana', id: '18' }, { name: 'Iowa', id: '19' }, { name: 'Kansas', id: '20' }, { name: 'Kentucky', id: '21' }, { name: 'Louisiana', id: '22' }, { name: 'Maine', id: '23' }, { name: 'Maryland', id: '24' }, { name: 'Massachusetts', id: '25' }, { name: 'Michigan', id: '26' }, { name: 'Minnesota', id: '27' }, { name: 'Mississippi', id: '28' }, { name: 'Missouri', id: '29' }, { name: 'Montana', id: '30' }, { name: 'Nebraska', id: '31' }, { name: 'Nevada', id: '32' }, { name: 'New Hampshire', id: '33' }, { name: 'New Jersey', id: '34' }, { name: 'New Mexico', id: '35' }, { name: 'New York', id: '36' }, { name: 'North Carolina', id: '37' }, { name: 'North Dakota', id: '38' }, { name: 'Ohio', id: '39' }, { name: 'Oklahoma', id: '40' }, { name: 'Oregon', id: '41' }, { name: 'Pennsylvania', id: '42' }, { name: 'Rhode Island', id: '44' }, { name: 'South Carolina', id: '45' }, { name: 'South Dakota', id: '46' }, { name: 'Tennessee', id: '47' }, { name: 'Texas', id: '48' }, { name: 'Utah', id: '49' }, { name: 'Vermont', id: '50' }, { name: 'Virginia', id: '51' }, { name: 'West Virginia', id: '54' }, { name: 'Washington', id: '53' }, { name: 'Wisconsin', id: '55' }, { name: 'Wyoming', id: '56' }, { name: 'Puerto Rico', id: '72' } ]

const REPORTS = [ 
    { name: 'Population by Geographic Area and Year', 
        fields: [ 
            { name: 'Population', code: 'B01003_001E', type: 'number' } 
        ], 
        isTrend: true 
    },
    { name: 'Poverty Rate by Geographic Area and Year',  
        fields: [ 
            { name: 'Percent Below Poverty Rate', code: 'B17001_002E,B17001_001E', type: 'percent'} 
        ], 
        isTrend: true 
    },
    { name: 'Ethnicity as a Percentage of the Population by Geographic Area',  
        fields: [ 
            { name: 'Hispanic or Latio Origin (of any race)', code: 'B03001_003E,B03001_001E', type: 'percent' },
            { name: 'Hispanic or Latio Origin: Mexican', code: 'B03001_004E,B03001_001E', type: 'percent' },
            { name: 'Hispanic or Latio Origin: Puerto Rican', code: 'B03001_005E,B03001_001E', type: 'percent' },
            { name: 'Hispanic or Latio Origin: Cuban', code: 'B03001_006E,B03001_001E', type: 'percent' },  
            { name: 'Hispanic or Latio Origin: Other', code: 'B03001_007E,B03001_008E,B03001_016E,B03001_027E,B03001_001E', type: 'percent' }  
        ],
        isTrend: false 
    },
    { name: 'Foreign-Born Population by Geographic Area',  
        fields: [ 
            { name: 'Percent Foreign-Born', code: 'B05002_013E,B05002_001E', type: 'sumPct' },
            { name: 'Percent of Foreign-Born Population that is a non-US Citizen', code: 'B05002_021E,B05002_013E', type: 'sumPct' }
        ],
        isTrend: false 
    },
    { name: 'Language Spoken at Home (5 Years and Over) by Geographic Area',  
        fields: [ 
            { name: 'English', code: 'B16007_003E,B16007_009E,B16007_015E,B16007_001E', type: 'percent' },
            { name: 'Spanish', code: 'B16007_004E,B16007_010E,B16007_016E,B16007_001E', type: 'percent' },
            { name: 'Other Indo-European', code: 'B16007_005E,B16007_011E,B16007_017E,B16007_001E', type: 'percent' },
            { name: 'Asian and Pacific Islander', code: 'B16007_006E,B16007_012E,B16007_018E,B16007_001E', type: 'percent' },
            { name: 'Other', code: 'B16007_007E,B16007_013E,B16007_019E,B16007_001E', type: 'percent' },
        ], 
        isTrend: false 
    },
    { name: 'Median Age and Distribution of the Population by Geographic Area', 
        fields: [ 
            { name: 'Median Age', code: 'B01002_001E', type: 'decimal' }, 
            { name: 'Percent of Population under Age 5', code: 'B01001_003E,B01001_027E,B01001_001E', type: 'percent'},
                { name: 'Percent of Population under Over Age 65', code: 'B01001_020E,B01001_021E,B01001_022E,B01001_023E,B01001_024E,B01001_025E,B01001_044E,B01001_045E,B01001_046E,B01001_047E,B01001_048E,B01001_049E,B01001_001E', type: 'percent'}
            ], 
            isTrend: false 
    },
    { name: 'Number (and Percent) of Individuals Below Poverty Level by Race and Geographic Area',  
        fields: [ 
            { name: 'White', code: 'B17001A_002E,B17001A_001E', type: 'sumPct' },
            { name: 'Black or African American', code: 'B17001B_002E,B17001B_001E', type: 'sumPct' },
            { name: 'American Indian & Alaskan Native', code: 'B17001C_002E,B17001C_001E', type: 'sumPct' },
            { name: 'Asian', code: 'B17001D_002E,B17001D_001E', type: 'sumPct' },
            { name: 'Native Hawaiian or Other Pacific Islander', code: 'B17001E_002E,B17001E_001E', type: 'sumPct' },
            { name: 'Some other race', code: 'B17001F_002E,B17001F_001E', type: 'sumPct' },
            { name: 'Two or more races', code: 'B17001G_002E,B17001G_001E', type: 'sumPct' }
        ], 
        isTrend: false 
    },
    { name: 'Population (and Percentage of Population) by Race and Geographic Area', 
        fields: [ 
            { name: 'White (percent)', code: 'B02001_002E,B02001_001E', type: 'sumPct'},
            { name: 'Black or African American (percent)', code: 'B02001_003E,B02001_001E', type: 'sumPct'},
            { name: 'American Indian and Alaskan Native (percent)', code: 'B02001_004E,B02001_001E', type: 'sumPct'},
            { name: 'Asian (percent)', code: 'B02001_005E,B02001_001E', type: 'sumPct'},
            { name: 'Native Hawaiian & Other Pacific Islander (percent)', code: 'B02001_006E,B02001_001E', type: 'sumPct'},
            { name: 'Some other race (percent)', code: 'B02001_007E,B02001_001E', type: 'sumPct'},
            { name: 'Two or more races (percent)', code: 'B02001_008E,B02001_001E', type: 'sumPct'}, 
        ], 
        isTrend: false 
    }
]
