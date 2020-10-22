const codeReference = {}

const clearReportDetails = () => {
    const mainReport = document.querySelector( '.mainReport' )
    if ( mainReport )
        mainReport.remove()
}

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


const displayReport = () => {
    const report = REPORTS[ document.getElementById( 'selectReport' ).value ]

    let tableDiv = document.createElement( 'div' )
    tableDiv.className = 'divTable'
    tableDiv.style.gridTemplateColumns = '1fr '.repeat( report.fields.length + 1 );

    // give the report a title
    let newTitle = document.createElement ( 'div' )
    newTitle.className = 'divTableTitle'
    newTitle.innerText = report.name
    newTitle.style.gridColumn = `span ${report.fields.length + 1}`
    tableDiv.appendChild( newTitle )

    let newType = document.createElement ( 'div' )
    newType.innerHTML = `<em>${report.isTrend ? 'Trend Report (most recent 5 years)' : 'Single Year Report'}</em>`
    newType.style.gridColumn =  `span ${report.fields.length + 1}`
    tableDiv.appendChild( newType )

    let newCell = document.createElement( 'div' )
    newCell.innerText = 'Geographic Area'
    newCell.className = 'divTableCell divTableHeader divTableFirst'
    tableDiv.appendChild( newCell )
    report.fields.forEach ( e => {
        let newCell = document.createElement( 'div' )
        newCell.innerHTML = e.name
        newCell.className = 'divTableCell divTableHeader'
        tableDiv.appendChild( newCell )
    })
    

    document.querySelector( '#reportDisplay' ).appendChild( tableDiv )
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

    reportSelect.selectedIndex = -1
    reportSelect.addEventListener( 'change', displayReport )   
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
        // displayReportDetails()
    }
    catch (error ) {
        console.log ( error )
    }    
    
}

window.onload = () => {
    refreshReportSelection()

    getVariables()
}

