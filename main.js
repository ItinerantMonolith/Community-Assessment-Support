// +== figure out import/export so the static data variables can be in a different file for simplicity

const BASE_URL = "https://api.census.gov/data/"
const DATASET = "/acs/acs5?get="
const API_KEY = "&key=00032a8653c1b9fb53c830c4c2537cdb4e637e5f"

// state codes are fixed. the USCB API is looking for these two character ID's for the states.
const STATES = [ { name: 'Alabama', id: '01' }, { name: 'Alaska', id: '02' }, { name: 'Arizona', id: '04' }, { name: 'Arkansas', id: '05' }, { name: 'California', id: '06' }, { name: 'Colorado', id: '08' }, { name: 'Connecticut', id: '09' }, { name: 'Delaware', id: '10' }, { name: 'District of Columbia', id: '11' }, { name: 'Florida', id: '12' }, { name: 'Georgia', id: '13' }, { name: 'Idaho', id: '16' }, { name: 'Hawaii', id: '15' }, { name: 'Illinois', id: '17' }, { name: 'Indiana', id: '18' }, { name: 'Iowa', id: '19' }, { name: 'Kansas', id: '20' }, { name: 'Kentucky', id: '21' }, { name: 'Louisiana', id: '22' }, { name: 'Maine', id: '23' }, { name: 'Maryland', id: '24' }, { name: 'Massachusetts', id: '25' }, { name: 'Michigan', id: '26' }, { name: 'Minnesota', id: '27' }, { name: 'Mississippi', id: '28' }, { name: 'Missouri', id: '29' }, { name: 'Montana', id: '30' }, { name: 'Nebraska', id: '31' }, { name: 'Nevada', id: '32' }, { name: 'New Hampshire', id: '33' }, { name: 'New Jersey', id: '34' }, { name: 'New Mexico', id: '35' }, { name: 'New York', id: '36' }, { name: 'North Carolina', id: '37' }, { name: 'North Dakota', id: '38' }, { name: 'Ohio', id: '39' }, { name: 'Oklahoma', id: '40' }, { name: 'Oregon', id: '41' }, { name: 'Pennsylvania', id: '42' }, { name: 'Rhode Island', id: '44' }, { name: 'South Carolina', id: '45' }, { name: 'South Dakota', id: '46' }, { name: 'Tennessee', id: '47' }, { name: 'Texas', id: '48' }, { name: 'Utah', id: '49' }, { name: 'Vermont', id: '50' }, { name: 'Virginia', id: '51' }, { name: 'West Virginia', id: '54' }, { name: 'Washington', id: '53' }, { name: 'Wisconsin', id: '55' }, { name: 'Wyoming', id: '56' }, { name: 'Puerto Rico', id: '72' } ]

const REPORTS = [ 
    { name: 'Population by Geographic Area and Year', fields: [ { name: 'Year', code: 'B01003_001E', type: 'number' } ], isTrend: true },
    { name: 'Poverty Rate by Geographic Area and Year',  fields: [ { name: 'BelowPoverty', code: 'B17001_002E,B17001_001E', type: 'percent'} ], isTrend: true },
    { name: 'Median Age and Distribution of the Population by Geographic Area', 
    fields: [ 
        { name: 'Median Age', code: 'B01002_001E', type: 'decimal' }, 
        { name: 'Percent of Population under Age 5', code: 'B01001_003E,B01001_027E,B01001_001E', type: 'percent'},
            { name: 'Percent of Population under Over Age 65', code: 'B01001_020E,B01001_021E,B01001_022E,B01001_023E,B01001_024E,B01001_025E,B01001_044E,B01001_045E,B01001_046E,B01001_047E,B01001_048E,B01001_049E,B01001_001E', type: 'percent'}
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
    { name: 'Language Spoken at Home (5 Years and Over) by Geographic Area',  
        fields: [ 
            { name: 'English', code: 'B16007_003E,B16007_009E,B16007_015E,B16007_001E', type: 'percent' },
            { name: 'Spanish', code: 'B16007_004E,B16007_010E,B16007_016E,B16007_001E', type: 'percent' },
            { name: 'Other Indo-European', code: 'B16007_005E,B16007_011E,B16007_017E,B16007_001E', type: 'percent' },
            { name: 'Asian and Pacific Island', code: 'B16007_006E,B16007_012E,B16007_018E,B16007_001E', type: 'percent' },
            { name: 'Other', code: 'B16007_007E,B16007_013E,B16007_019E,B16007_001E', type: 'percent' },
        ], 
        isTrend: false 
    },
    { name: 'xxx Number (and percent) of Individuals Below Poverty Level by Race and Geographic Area',  fields: [ { name: 'Placeholder', code: 'B01003_001E' } ], isTrend: false },
    { name: 'xxx Poverty Rate by Family Status and Geographic Area',  fields: [ { name: 'Placeholder', code: 'B01003_001E' } ], isTrend: false }
]

let recentYear = 0      // this will get set to the most recent year we have available acs5 data.  use it as a default for reference calls as well.
let reportTypeTrend = false

const selectCounty = document.getElementById( 'selectCounty' )

const loadYears = async () => {
    // we want to get the 5 most recent available years, so we really just need to find the most recent and take that and the preceding 4.
    // so just do a simple call to get the us population for the years working backwards.
    let lookAgain = true
    recentYear = new Date().getFullYear() - 1       // start with last year, by definition there can't be a report for this year available

    while ( lookAgain ) {
        let urlPop = `${BASE_URL}${recentYear}${DATASET}B01003_001E&for=us${API_KEY}`
        try {
            let resp = await axios.get ( urlPop )
            lookAgain = false
        }
        catch ( error ) {
            recentYear--;
            if ( recentYear < new Date().getFullYear() - 5 ) {       // we have a problem getting the data
                return
            }
        }
    }
    
    // okay, so we know the most recent year, populate our select list.
    const selectYear = document.getElementById ( 'selectYear' )
    for ( i=0; i < 5; i++ ) {
        let newYear = document.createElement( 'option' )
        newYear.innerText = String( recentYear - i )
        newYear.value = recentYear - i
        selectYear.add( newYear )
    }

    // let's automatically load the counties for our first state.
    // we had to wait here until we knew our recentYear before we can do it
    refreshCounties ( document.getElementById('selectState').options[0].value )
}

const refreshCounties = async (state) => {
    let urlCounty = `${BASE_URL}${recentYear}${DATASET}NAME&for=county:*&in=state:${state}${API_KEY}`
    try {
        let resp = await axios.get ( urlCounty )
        // clear the list
        selectCounty.length = 0

        // result will be an array with each element in the form 
        // [ name, stateID, countyID ]
        // ex: [ "Falls Church city, Virginia", "51", "610" ]
        let myCounties = resp.data
        myCounties.shift()                                      // first item returned is the header row, so remove it
        myCounties.sort( (a, b) => a[0] < b[0] ? -1 : 1 )       
        myCounties.forEach( (e, i) => {
            let newCounty = document.createElement( 'option' )
            newCounty.innerText = e[0].substring(0, e[0].indexOf(','))
            newCounty.value = e[2]
            selectCounty.add( newCounty )
        })
    }
    catch ( error ) {
        // +== add better error handling
        console.log ( `Error trying to get Counties. ${error}`)
    }

    countyList.clearList()
    zipList.clearList()
}


class FilterList {
    constructor ( itemType, sortAsc = true ) {
        this._itemType = itemType
        this._filterList = []
        this._divList = document.getElementById ( `${this._itemType}List` )
        this._sortAsc = sortAsc
    }

    get filterList() { return this._filterList }

    clearDisplay () {
        while ( this._divList.firstChild )
            this._divList.firstChild.remove()
    }

    removeItem ( that, value ) {
        // find the value in my _filterList and remove it.
        that._filterList = that._filterList.filter ( e => e.name != value )
        this.updateDisplay()
    }

    updateDisplay ()  {
        this.clearDisplay()
        // clear and refresh the display list for this geo type
        this._filterList.forEach ( e => {
            let newItem = document.createElement( 'div' )
            newItem.innerText = e.name
            newItem.className = 'areaItem'
            newItem.dataset.itemType = this.itemType
            newItem.addEventListener ( 'click', e => {
                let that = this
                this.removeItem (that, e.target.innerText)
            })
            this._divList.append( newItem )
        })
    }

    clearList () {
        this._filterList.length = 0
        this.updateDisplay()
    }

    showList () {
        // for debugging only
        this._filterList.forEach ( e => console.log ( e ) )
    }

    addFilter ( displayText, value ) {
        let newFilter = { name: displayText , filterID: value } 

        // use a reduce to see if this value is already in there
        if ( !this._filterList.reduce( ( isThere, e ) => { return isThere || newFilter.filterID === e.filterID }, false) ) {
            this._filterList.push ( newFilter )
            // sort the list for display
            if ( this._sortAsc )
                this._filterList.sort( (a,b) => parseInt(a.filterID) - parseInt(b.filterID) )
            else
                this._filterList.sort( (a,b) => parseInt(b.filterID) - parseInt(a.filterID) )
            this.updateDisplay ()
        }
    }

    get hasFilters () { return this._filterList.length > 0 }
}


class Report {
    constructor ( reportDefinition ) {
        this._name = reportDefinition.name
        this._fields = reportDefinition.fields    // fields is an array of objects [ { name: 'Total Population', code: 'B01003_001E' }, {...}, ... ]
        this._isTrend = reportDefinition.isTrend // trend report should have only one field and will be applied to multiple years
        this._results = []
        this._resultCount = 0
        this._countyFilters = []
        this._zipFilters = []
        this._state = document.getElementById( 'selectState' ).value
    }

    addFilters = ( filters, type ) => {
        if ( type === 'county' )
            this._countyFilters = filters  // an array of filter objects, of the form { name: , filterID: , type: [county|zip] }
        else
            this._zipFilters = filters
    }

    headerRow = () => {
        let header = [ 'Geographic Area' ]
        if ( this._isTrend ) 
            for (let i=0; i < 5; i++ )
                header.push ( String ( recentYear - ( 4- i ) ) )
        else
            this._fields.forEach ( e => header.push ( e.name ) )

        return header
    }

    displayResults ( results ) {
        // build the header row and stick it in front
        results.unshift ( this.headerRow () )

        let tableDiv = document.createElement( 'div' )

        tableDiv.className = 'divTable'
        tableDiv.style.gridTemplateColumns = '1fr '.repeat( results[0].length );
        // give the report a title
        let newTitle = document.createElement ( 'div' )
        newTitle.className = 'divTableTitle'
        newTitle.innerText = this._name
        newTitle.style.gridColumn = `span ${results[0].length}`
        tableDiv.appendChild( newTitle )

        // put the data in the table
        results.forEach ( (resRow, index) => {
            resRow.forEach ( e => {
                let newDiv = document.createElement( 'div' )
                if ( index === 0 )
                    newDiv.className = 'divTableCell divTableHeader'
                else if ( index === results.length - 1 )
                    newDiv.className = 'divTableCell divTableSummary'
                else
                    newDiv.className = 'divTableCell'
                
                newDiv.innerText = e

                tableDiv.appendChild( newDiv )                    
            })
        })

        document.querySelector ( 'body' ).append( tableDiv )
    }

    processResults = () => {
        if ( this._resultCount != this._results.length )
            return

        // All requests processed

        this._results.sort ( (a,b) => {
            if ( a.type === b.type ) {
                return a.year < b.year ? -1 : 1
            }
            else {  // sort by type
                return a.type < b.type ? -1 : 1
            }
        })
        
        // at this point, _results is sorted by type (county, zip, zState), year (only meaningful for _isTrend), and then the first field of the result, which should be the geo area.
        // if it's an _isTrend, we need to transpose the years into columns.
        // otherwise we basically have the report table.

        let resultTable = []
        let offset = 0
        if ( this._isTrend ) {      // because it's trend data, we have to transpose the years
            let lastType = ''
            this._results.forEach ( qry => {
                if ( lastType != qry.type ) {
                    // first of this type, so lets create new rows
                    offset = resultTable.length

                    qry.data.forEach ( e => {
                        let newArr = [ e[0] ]
                        resultTable.push ( newArr )
                    })

                    lastType = qry.type
                }

                qry.data.forEach ( (e, index) => {
                    // e is a row (array) of result data.
                    // tag the results with field types, and we might have a percent to process, which uses two fields
                    resultTable[ index + offset ].push ( this._fields[0].type === 'percent' ? `${(100*e[1]/e[2]).toFixed(1)}%` :  parseInt( e[1] ).toLocaleString()  )
                })
            })
        }
        else {
            // non trend table
            // for the moment, assume simple data
            this._results.forEach ( qry => {
                // e is a query result.  e.data is an array of arrays
                qry.data.forEach ( e => {
                    // in this case, lets walk them using the fields. 
                    // first value will be the geo name
                    let newArr = [ e[0] ]
                    let fieldOffset = 0
                    this._fields.forEach ( field => {
                        fieldOffset++
                        // deal with percentage here.
                        if ( ( field.type === 'percent' ) || ( field.type === 'sumPct' ) ) {
                            // newArr.push( { type: 'percent', value: (100 * e[fieldOffset] / e[fieldOffset + 1 ]).toFixed(1) } )
                            // fieldOffset++
                            // in this case this._fields.code will have multiple comma separated entries, the last is the divisor, all others should be totaled for the numerator
                            let sum = 0
                            let fieldCount = field.code.split(',').length - 1
                            while ( fieldCount ) {
                                sum += parseInt(e[fieldOffset])
                                fieldOffset++
                                fieldCount--
                            }
                            let sumPct = (100 * sum / e[fieldOffset]).toFixed(1)
                            if ( field.type === 'percent' )
                                newArr.push( `${sumPct}%` )
                            else {
                                newArr.push( `${parseInt( sum ).toLocaleString()} (${sumPct}%)` )
                            }
                        }
                        else if ( field.type === 'sum' ) {
                            // in this case this._fields.code will have multiple comma separated entries.
                            let sum = 0
                            let fieldCount = field.code.split(',').length
                            while ( fieldCount ) {
                                sum += parseInt(e[fieldOffset])
                                fieldOffset++
                                fieldCount--
                            }
                            fieldOffset--       // we incremented by as many as we used, but we want the counter to end on the last element we used.
                            newArr.push(  parseInt( sum ).toLocaleString() )
                        }
                        else if ( field.type === 'number' )
                            newArr.push(  parseInt( e[fieldOffset] ).toLocaleString() )
                        else if ( field.type === 'decimal' )
                            newArr.push(  parseFloat( e[fieldOffset] ).toFixed(1).toLocaleString() )
                        else 
                            newArr.push( e[fieldOffset] )
                    })
                    resultTable.push ( newArr )
                })
            })
        }

        // console.log ( resultTable )
        this.displayResults ( resultTable )
    }


    requestData = async ( filterType, year ) => {
        this._resultCount++

        // build the field string portion of the query:  "NAME,BO1003_001E" for instance
        let fieldString = 'NAME'
        this._fields.forEach ( e => fieldString += `,${e.code}`)   

        // build the geo filter string
        let geoString = '&for='

        if ( filterType === 'zstate' ) {
            geoString = `&for=state:${this._state}`
        }
        else {
            let whichFilters = null
            let stateString = ''
        
            if ( filterType === 'county' ) {
                geoString += 'county:'
                // counties must be 3 digits
                whichFilters = this._countyFilters
                stateString = `&in=state:${this._state}`
            }
            else {      // 'zip'
                geoString += 'zip%20code%20tabulation%20area:'
                whichFilters = this._zipFilters
            }
            let isFirst = true
            whichFilters.forEach ( e => {
                geoString += `${isFirst ? '' : ','}${String(e.filterID)}`
                isFirst = false
            })
            geoString += stateString
        }

        let myURL = `${BASE_URL}${year}${DATASET}${fieldString}${geoString}${API_KEY}`

        try {
            let response = await axios.get ( myURL )
            // console.log ( year, response )
            let respData = response.data
            respData.shift()    // remove the "header" row
            // now sort it
            respData.sort( (a, b) => a[0] < b[0] ? -1 : 1 )
            // if we did counties, we need to scrub the name which will be "Fairfax County, Virginia" to remove the state
            if ( filterType === 'county' ) 
                respData.forEach ( (e,index) => respData[index][0] = e[0].substring(0, e[0].indexOf(',')) )
            
            this._results.push ( { type: filterType, year: year, data: respData } )
            this.processResults()
        }
        catch ( error ) {
            // +== add better error handling
            console.log ( `Error in requestData: ${error}`)
        }
    }

    runReports = () => {
        // for each geo filter type (county/zip), we're going to make the call once (for non-trend) or 5 times ( for trend )
        // additionally, we create a summary row for the state as a third type

        // so now walk the filter types
        this._results = []
        this._resultCount = 0

        for (let fType of ['county', 'zip', 'zstate'] ) {
            if ( ( fType === 'county' && this._countyFilters.length ) || ( fType === 'zip' && this._zipFilters.length ) || ( fType === 'zstate')) {
                if ( this._isTrend ) {
                    for (let i=0; i<5; i++)
                        this.requestData ( fType, recentYear - (4 - i) )
                }
                else
                    this.requestData ( fType, document.getElementById ( 'selectYear' ).value )
            }
        }
    }

}


const setupGeoFilters = () => {
    // load our state list and set up the event listeners & handlers for the county & zip filters
    
    const selectState = document.getElementById( 'selectState' )

    selectState.addEventListener ( 'change', e => refreshCounties( e.target.value ) )

    STATES.forEach ( e => {
        let newState = document.createElement( 'option' )
        newState.innerText = e.name
        newState.value = e.id
        selectState.add ( newState )
    })

    document.getElementById( 'btnCounty' ).addEventListener ( 'click', () => {
        countyList.addFilter ( selectCounty.options[ selectCounty.selectedIndex ].innerText, selectCounty.value )
    })

    document.getElementById( 'btnZip' ).addEventListener ( 'click', () => {
        const textZip = document.getElementById( 'textZip' )
        if ( textZip.value != "" ) {
            zipList.addFilter ( textZip.value, textZip.value )
            textZip.value = ""
        }
    })
}

const refreshReportSelection = () => {
    const reportSelect = document.getElementById( 'selectReport' )
    reportSelect.length = 0
    REPORTS.forEach( (e,i) => {
        if ( e.isTrend === reportTypeTrend ) {
            let newReport = document.createElement ( 'option' )
            newReport.innerText = e.name
            newReport.value = i
            reportSelect.add ( newReport )
        }
    })
    reportList.clearList()
}

const loadReports = () => {
    const reportSelectType = document.getElementById( 'selectReportType' )
    let newReportType = document.createElement ( 'option' )
    newReportType.innerText = "Single Year Reports"
    newReportType.value = false
    reportSelectType.add ( newReportType )

    newReportType = document.createElement ( 'option' )
    newReportType.innerText = "Trend (Mulit-Year) Reports"
    newReportType.value = true
    reportSelectType.add ( newReportType )

    // we start with single year reports selected.
    reportTypeTrend = false
    document.getElementById( 'multiMsg' ).style.display = 'none'
    refreshReportSelection()

    reportSelectType.addEventListener ( 'change', e => {
        reportTypeTrend = e.target.value === 'true'         // .value seems to convert to a string
        document.getElementById( 'divSelectYear' ).style.display = reportTypeTrend ? 'none' : ''
        document.getElementById( 'multiMsg' ).style.display = reportTypeTrend ? '' : 'none'
        refreshReportSelection() 
    })

    const selectReport = document.getElementById( 'selectReport' )
    // wire the handler for btnReport   +==
    document.getElementById( 'btnReport' ).addEventListener ( 'click', () => {
        reportList.addFilter ( selectReport.options[ selectReport.selectedIndex ].innerText, selectReport.value )
    })

}


const generateReports = () => {
    // this is where the magic happens!
    // each report will be executed once for each type of geo filter.  if it's a trend report, it will be executed once per year per filter type.
    
    // +== add a check that we have some geo filters and reports selected..

    if ( !countyList.hasFilters && !zipList.hasFilters ) {
        alert ( "Please add one or more Geographic filters.")
        return
    }
    if ( !reportList.hasFilters ) {
        alert ( "Please select one or more reports" )     // prettify that
        return
    }

    // create an array of report instances
    const reports = []

    reportList.filterList.forEach( e => {
        let newReport = new Report ( REPORTS[e.filterID] )
        if ( countyList.hasFilters ) 
            newReport.addFilters ( countyList.filterList, 'county' )
        if ( zipList.hasFilters )
            newReport.addFilters ( zipList.filterList, 'zip' )
        reports.push ( newReport )
    })

    // request each report to go request it's data.
    // When they return are we filling in the reports dynamically, or do we wait for them all?
    //      if dynamic, do we reorder them as they come in?
    reports.forEach ( e => e.runReports() )
}



const countyList = new FilterList ( 'county' )
const zipList = new FilterList ( 'zip' )
const reportList = new FilterList ( 'report' )

window.onload = () => {
    setupGeoFilters()
    loadYears()
    loadReports()
   
    // enable the generate button
    document.getElementById( 'btnGenerate' ).addEventListener( 'click', generateReports )
}

