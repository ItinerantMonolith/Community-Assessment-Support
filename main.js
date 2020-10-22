// note: all the static data (URLs, keys, state codes, etc) is in the staticReport.js file.

let recentYear = 0      // this will get set to the most recent year we have available acs5 data.  use it as a default for reference calls as well.
let reportTypeTrend = false

const iconTrash = '<i class="material-icons" style="font-size:12px;">delete</i>'

const selectCounty = document.getElementById( 'selectCounty' )

const setupReportSelection = async () => {
    // we want to get the 5 most recent available years, so we really just need to find the most recent and take that and the preceding 4.
    // so just do a simple call to get the us population for the years working backwards.
    let lookAgain = true
    recentYear = new Date().getFullYear() - 1       // start with last year, by definition there can't be a report for this year available

    while ( lookAgain ) {
        let urlPop = `${CB_BASE_URL}${recentYear}${CB_DATASET}B01003_001E&for=us${CB_API_KEY}`
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
    
    // now that we know the recent year, we can refresh counties, which needs that before it can make the request.
    refreshCounties( document.getElementById( 'selectState' ).value )

    // now populate our reportType selector
    const reportSelectType = document.getElementById( 'selectReportType' )
    for ( i=0; i < 5; i++ ) {
        let newYear = document.createElement( 'option' )
        newYear.innerText = `Single Year Reports for ${String( recentYear - i )}`
        newYear.value = recentYear - i
        reportSelectType.add( newYear )
    }
    let newReportType = document.createElement ( 'option' )
    newReportType.innerText = "Trend Reports (most recent 5 years)"
    newReportType.value = 'trend'
    reportSelectType.add ( newReportType )

    // we start with single year reports selected for the current year
    reportSelectType.selectedIndex = 0
    reportTypeTrend = false
    refreshReportSelection()

    // set up the handler for the reportType selector
    reportSelectType.addEventListener ( 'change', e => { 
        // we only need to do something here if the trend type changes, not if we change within a trend type
        const newTrend = e.target.value === 'trend'
        if ( reportTypeTrend != newTrend ) {
            reportTypeTrend = newTrend
            refreshReportSelection()
        }
    } )

    const selectReport = document.getElementById( 'selectReport' )
    selectReport.addEventListener ( 'change', e => {
        reportList.addFilter ( e.target.options[ e.target.selectedIndex ].innerText, e.target.value )
    })

    // handlers for the generate and clear reports buttons
    document.getElementById( 'btnGenerate' ).addEventListener( 'click', generateReports )
    document.getElementById( 'btnClear' ).addEventListener( 'click', e => {
        const divTables = document.querySelectorAll( '.divTable' )
        divTables.forEach ( e => e.remove())
    })
    
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
    selectState.selectedIndex = 0

    document.getElementById( 'selectCounty' ).addEventListener ( 'change', () => {
        countyList.addFilter ( selectCounty.options[ selectCounty.selectedIndex ].innerText, selectCounty.value )
    })

    document.getElementById( 'btnZip' ).addEventListener ( 'click', () => {
        const textZip = document.getElementById( 'textZip' )
        if ( textZip.value != "" ) 
            validateZip ( textZip.value )
    })
}



const refreshCounties = async (state) => {
    let urlCounty = `${CB_BASE_URL}${recentYear}${CB_DATASET}NAME&for=county:*&in=state:${state}${CB_API_KEY}`
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

    selectCounty.selectedIndex = -1
    countyList.clearList()
    zipList.clearList()
}


const validateZip = async ( zip ) => {
    try {
        const resp = await axios.get ( `${ZIP_URL}${zip}` )
        const curState = selectState.options[ selectState.selectedIndex ].innerText

        if ( resp.data.places[0].state === curState ) {
            zipList.addFilter ( zip, zip )
            textZip.value = ""            
        }
        else {
            alert ( `${textZip.value} is not in ${curState}` )
        }
        textZip.focus()
    }
    catch (error) {
        // a 404 here may mean the zip code doesn't exist
        if ( error.message.indexOf('404') >= 0) {
            alert ( `${textZip.value} is not a valid zip code.` )
            textZip.value = ""
            textZip.focus()
        }
        else
            console.log ( error )
    }
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
        this._filterList.forEach ( filter => {
            let newItem = document.createElement( 'div' )
            newItem.innerText = filter.name
            newItem.className = `areaItem ${this._itemType}Item`
            newItem.dataset.itemType = this.itemType
            newItem.addEventListener ( 'click', e => {
                let that = this
                this.removeItem (that, e.target.innerHTML)
            })
            this._divList.append( newItem )
        })
        checkGenerateButton()
    }

    clearList () {
        this._filterList.length = 0
        this.updateDisplay()
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
            resRow.forEach ( (e, index2) => {
                let newDiv = document.createElement( 'div' )
                if ( index === 0 )
                    newDiv.className = 'divTableCell divTableHeader'
                else if ( index === results.length - 1 ) {
                    newDiv.className = 'divTableCell divTableSummary'
                }
                else
                    newDiv.className = 'divTableCell'

                if ( index2 === 0 ) 
                    newDiv.classList.add ( 'divTableFirst' )

                newDiv.innerText = e

                tableDiv.appendChild( newDiv )                    
            })
        })

        document.querySelector ( '#divReportDisplay' ).append( tableDiv )
    }

    processResults = () => {
        if ( this._resultCount != this._results.length )
            return

        // If we're here, then all the parallel field requests for this report have been processed

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
        if ( this._isTrend ) {      
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
                    // +== in the future, we could have a percent with a multi-code numerator, need to support that.
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
                            
                            // in this case this._fields.code will have multiple comma separated entries, the last is the divisor, all others should be totaled for the numerator
                            let sum = 0
                            let fieldCount = field.code.split(',').length - 1
                            while ( fieldCount ) {
                                sum += parseInt(e[fieldOffset])
                                fieldOffset++
                                fieldCount--
                            }
                            // if the denominator is 0, we don't want to show anything.
                            if ( parseInt( e[fieldOffset] ) ) {
                                let sumPct = (100 * sum / e[fieldOffset]).toFixed(1)
                                if ( field.type === 'percent' )
                                    newArr.push( `${sumPct}%` )
                                else {
                                    newArr.push( `${parseInt( sum ).toLocaleString()} (${sumPct}%)` )
                                }
                            }
                            else
                                newArr.push( 'n/a' )
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

        let myURL = `${CB_BASE_URL}${year}${CB_DATASET}${fieldString}${geoString}${CB_API_KEY}`

        try {
            let response = await axios.get ( myURL )
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
                    this.requestData ( fType, document.getElementById ( 'selectReportType' ).value )
            }
        }
    }

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
    reportSelect.selectedIndex = -1
}


const checkGenerateButton = () => {
    // if we have no reports or we have no geo filters, we can't generate anything
    document.getElementById( 'btnGenerate' ).disabled = ( !countyList.hasFilters && !zipList.hasFilters ) || ( !reportList.hasFilters ) 
}


const generateReports = () => {
    // this is where the magic happens!
    // each report will be executed once for each type of geo filter.  if it's a trend report, it will be executed once per year per filter type.
    
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

    // request each report to go execute
    reports.forEach ( e => e.runReports() )
}

const countyList = new FilterList ( 'county' )
const zipList = new FilterList ( 'zip' )
const reportList = new FilterList ( 'report' )

window.onload = () => {
    setupGeoFilters()
    setupReportSelection()
}

