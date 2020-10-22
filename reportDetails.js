const codeReference = {}

const clearReportDetails = () => {
    const mainReport = document.querySelector( '.mainReport' )
    if ( mainReport )
        mainReport.remove()
}

const addDiv = ( parent, text, className ) => {
    const newDiv = document.createElement( 'div' )
    if ( text )
        newDiv.innerText = text
    if ( className )
        newDiv.className = className

    parent.appendChild ( newDiv )
}

const addLabel = ( parent, text ) => addDiv ( parent, text, 'reportLabel' )

const typeDisplay = { 
    number: 'Number',
    percent: 'Percent:  all but last data elements are added together and divided by the final element',
    sum: 'Sum: all data elements are added together',
    sumPct: 'Sum/Percent:   all but last data elements are added together and divided by the final element. Sum (numerator) is also displayed.',
    string: 'String',
    decimal: 'Number with a single decimal point'
    }


const displayReportDetails = () => {
    clearReportDetails ()

    const report = REPORTS[ document.getElementById( 'selectReport' ).value ]

    //  Report Title
    //  Trend or Year based
    //  list of fields, for each
    //      Field Name
    //          list of data elements that comprise it, with data type.

    const mainReport = document.createElement( 'div' )
    mainReport.className = 'mainReport' 
    addLabel( mainReport, 'Title:' ) 
    addDiv( mainReport, report.name )
    addLabel( mainReport, 'Type:' )
    addDiv( mainReport, report.isTrend ? 'Trend Report (most recent 5 years)' : 'Single Year Report' )
    report.fields.forEach ( field => {
        let fieldBlock = document.createElement( 'div' )
        fieldBlock.className = 'fieldBlock'
        addLabel( fieldBlock, 'Field:' ) 
        addDiv( fieldBlock, field.name )
        addLabel( fieldBlock, 'Type:' )
        addDiv( fieldBlock, typeDisplay[ field.type ] )
        addLabel( fieldBlock, 'Data:' )
        addDiv( fieldBlock )
        field.code.split(',').forEach ( code => {
            addDiv( fieldBlock )
            let codeDetail = codeReference[ code ].label.split('!!')
            codeDetail.shift()  // remove "Estimate"
            let codeStr = `${code}: ${codeReference[ code ].concept} : ${codeDetail.join(', ')}`
            addDiv( fieldBlock,codeStr )
        })

        mainReport.appendChild( fieldBlock )
    })

    document.querySelector( '#divReports' ).appendChild( mainReport )
}


const refreshReportSelection = () => {
    const reportSelect = document.getElementById( 'selectReport' )
    reportSelect.length = 0
    REPORTS.forEach( (e,i) => {
        let newReport = document.createElement ( 'option' )
        newReport.innerText = e.name
        newReport.value = i
        reportSelect.add ( newReport )
    })

    reportSelect.addEventListener( 'change', displayReportDetails )   
}


const getVariables = async () => {
    try {
        const resp = await axios.get ( 'https://api.census.gov/data/2018/acs/acs5/variables.json' )

        REPORTS.forEach( rep => {
            rep.fields.forEach ( field => {
                field.code.split(',').forEach ( code => {
                    codeReference[ code ] = resp.data.variables[ code ]
                })
            })
        })
        displayReportDetails()
    }
    catch (error ) {
        console.log ( error )
    }    
    
}

window.onload = () => {
    refreshReportSelection()

    getVariables()
}

