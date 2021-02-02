# Community-Assessment-Support Tool
#### created by Aaron Walker

## Project Description
 ### *Foundations for Families* (FFF) is a consulting organization which provides support for early childhood educational providers and systems.  One of the main services includes data collection to support federal requirements for Head Start agencies to provide an annual Community Assessment.  A significant amount of effort goes into mining data from the U.S Census Bureau to include in these reports. This tool is designed to streamline the creation of key data tables for FFF by accessing the Census Bureau public API.

### Using the American Community Survey (ACS) dataset from the Census Bureau, the user has access to over 24,000 data points.  This tool will grant access to predefined collections of data points, grouped by year and geographical area (state, community, and/or zip) and present them in appropriately formatted tables.  A user will be able to select one or more years of data, refine that by geographical area, and then select which from among the predefined reports they want to view. 

## Report Scope
FFF routinely generates more than 20 reports from U.S. Census Bureau data to include in their Community Assessements.  The inital scope of this tool was 8 reports, with additional reports added as they are identified by FFF and analyzed to ensure valid implementation is possible. Initial reports were:
* Population by Geographic Area and Year
* Median Age and Distribution of the Population by Geographic Area
* Population (and Percentage of Population) by Race and Geographic Area
* Ethnicity as a Percentage of the Population by Geographic Area
* Language Spoken at Home (5 Years and Over) by Geographic Area
* Poverty Rate by Geographic Area and Year
* Number (and percent) of Individuals Below Poverty Level by Race and Geographic Area
* Foreign-Born Population by Geographic Area


## U.S. Census Bureau API
The Census Bureau API is defined by year, dataset, subset, and parameters which include specific field identifiers and geographic filters.
In this example, we are calling the 2018 ACS5 (5-year estimates) subset of the ACS dataset, and requesting the the field Name and the General Population variable (identified as "B01003_001E") from three counties (#053, #119, and #touch127) in Florida (state=12).  The request url would be:

```
https://api.census.gov/data/2018/acs/acs5?get=NAME,B01003_001E&for=county:053,119,127&in=state:12
```
The returned result is json but formatted as an array of data arrays, with the first array giving the equivalent of object names or column headings, depending on how you view it.
```
[   
    [ "NAME", "B01003_001E", "state", "county" ],
    [ "Sumter County, Florida", "120999", "12", "119" ],
    [ "Volusia County, Florida", "527634", "12", "127" ],
    [ "Hernando County, Florida", "182696", "12", "053" ]
]
```

## Tracking
#### Task tracking will be on a kanban board at Trello: https://trello.com/b/hNTAwNWs

## Reference Links
Foundations for Families:  https://foundationsforfamilies.com/

US Census Bureau API guide: https://www.census.gov/data/developers/guidance/api-user-guide.html

