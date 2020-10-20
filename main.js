// +== figure out import/export so the static data variables can be in a different file for simplicity

const BASE_URL = "https://api.census.gov/data/"
const DATASET = "/acs/acs5?get="
const API_KEY = "&key=00032a8653c1b9fb53c830c4c2537cdb4e637e5f"

// state codes are fixed. the USCB API is looking for these two character ID's for the states.
const STATES = [ { name: 'Alabama', id: '01' }, { name: 'Alaska', id: '02' }, { name: 'Arizona', id: '04' }, { name: 'Arkansas', id: '05' }, { name: 'California', id: '06' }, { name: 'Colorado', id: '08' }, { name: 'Connecticut', id: '09' }, { name: 'Delaware', id: '10' }, { name: 'District of Columbia', id: '11' }, { name: 'Florida', id: '12' }, { name: 'Georgia', id: '13' }, { name: 'Idaho', id: '16' }, { name: 'Hawaii', id: '15' }, { name: 'Illinois', id: '17' }, { name: 'Indiana', id: '18' }, { name: 'Iowa', id: '19' }, { name: 'Kansas', id: '20' }, { name: 'Kentucky', id: '21' }, { name: 'Louisiana', id: '22' }, { name: 'Maine', id: '23' }, { name: 'Maryland', id: '24' }, { name: 'Massachusetts', id: '25' }, { name: 'Michigan', id: '26' }, { name: 'Minnesota', id: '27' }, { name: 'Mississippi', id: '28' }, { name: 'Missouri', id: '29' }, { name: 'Montana', id: '30' }, { name: 'Nebraska', id: '31' }, { name: 'Nevada', id: '32' }, { name: 'New Hampshire', id: '33' }, { name: 'New Jersey', id: '34' }, { name: 'New Mexico', id: '35' }, { name: 'New York', id: '36' }, { name: 'North Carolina', id: '37' }, { name: 'North Dakota', id: '38' }, { name: 'Ohio', id: '39' }, { name: 'Oklahoma', id: '40' }, { name: 'Oregon', id: '41' }, { name: 'Pennsylvania', id: '42' }, { name: 'Rhode Island', id: '44' }, { name: 'South Carolina', id: '45' }, { name: 'South Dakota', id: '46' }, { name: 'Tennessee', id: '47' }, { name: 'Texas', id: '48' }, { name: 'Utah', id: '49' }, { name: 'Vermont', id: '50' }, { name: 'Virginia', id: '51' }, { name: 'West Virginia', id: '54' }, { name: 'Washington', id: '53' }, { name: 'Wisconsin', id: '55' }, { name: 'Wyoming', id: '56' }, { name: 'Puerto Rico', id: '72' } ]

const REPORTS = [ { name: 'Population by Geographic Area and Year', fields: [ { name: 'Year', code: 'B01003_001E' } ], isTrend: true } ]

let recentYear = 0      // this will get set to the most recent year we have available acs5 data.  use it as a default for reference calls as well.
let yearsSelected = []

const selectCounty = document.getElementById( 'selectCounty' )

const setupYears = async () => {
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

    document.getElementById ( 'btnYear' ).addEventListener( 'click', () => {
        yearList.addFilter ( document.getElementById ( 'selectYear' ).value, document.getElementById ( 'selectYear' ).value )
        // +== refresh the report list here to determine if we have multiple years or not to show trend reports
    })

    document.getElementById( 'btnCounty' ).addEventListener ( 'click', () => {
        countyList.addFilter ( selectCounty.options[ selectCounty.selectedIndex ].innerText, selectCounty.value )
    })

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
            newCounty.value = parseInt(e[2])
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
        this.itemType = itemType
        this.filterList = []
        this.divList = document.getElementById ( `${this.itemType}List` )
        this.sortAsc = sortAsc
        this.updateMultiMsg()
    }

    clearDisplay () {
        while ( this.divList.firstChild )
            this.divList.firstChild.remove()
    }

    removeItem ( that, value ) {
        // find the value in my filterList and remove it.
        that.filterList = that.filterList.filter ( e => e.name != value )
        this.updateDisplay()
    }

    updateDisplay ()  {
        this.clearDisplay()
        // clear and refresh the display list for this geo type
        this.filterList.forEach ( e => {
            let newItem = document.createElement( 'div' )
            newItem.innerText = e.name
            newItem.className = 'areaItem'
            newItem.dataset.itemType = this.itemType
            newItem.addEventListener ( 'click', e => {
                let that = this
                this.removeItem (that, e.target.innerText)
            })
            this.divList.append( newItem )
        })
        this.updateMultiMsg()
    }

    clearList () {
        this.filterList.length = 0
        this.updateDisplay()
        this.updateMultiMsg()
    }

    showList () {
        // for debugging only
        this.filterList.forEach ( e => console.log ( e ) )
    }

    updateMultiMsg () {
        const multiMsg = document.getElementById(`${this.itemType}Multi`)
        if ( multiMsg != null ) {
            if ( this.filterList.length > 1 )
                multiMsg.style.display = ''
            else
                multiMsg.style.display = 'none'
        }
    }

    addFilter ( displayText, value ) {
        let newFilter = { name: displayText , filterID: value } 

        // use a reduce to see if this value is already in there
        if ( !this.filterList.reduce( ( isThere, e ) => { return isThere || newFilter.filterID === e.filterID }, false) ) {
            this.filterList.push ( newFilter )
            // sort the list for display
            if ( this.sortAsc )
                this.filterList.sort( (a,b) => parseInt(a.filterID) - parseInt(b.filterID) )
            else
                this.filterList.sort( (a,b) => parseInt(b.filterID) - parseInt(a.filterID) )
            this.updateDisplay ()
        }
  
    }

}


class Report {
    constructor ( name, fields, isTrend ) {
        this.name = name
        this.fields = fields    // fields is an array of objects [ { name: 'Total Population', code: 'B01003_001E' }, {...}, ... ]
        this._isTrend = isTrend // trend report should have only one field and will be applied to multiple years
    }

    fieldString () {
        let filter = "NAME"
        this.fields.forEach ( e => filter += `,${e.code}`)
        return filter
    }

    headers () {
        let headerList = []
        this.fields.forEach ( e => headerList.push( e.name ) )
        return headerList
    }

    get isTrend() { return this._isTrend }
}


const countyList = new FilterList ( 'county' )
const zipList = new FilterList ( 'zip' )
const yearList = new FilterList ( 'year', false )

const setupGeoFilters = () => {
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

setupGeoFilters()
setupYears()


