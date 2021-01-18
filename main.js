// note: all the static data (URLs, keys, state codes, etc) is in the staticReport.js file.

let recentYear = 0 // this will get set to the most recent year we have available acs5 data.  use it as a default for reference calls as well.
let reportTypeTrend = false

const selectCounty = document.getElementById('selectCounty')

const setupReportSelection = async () => {
   // we want to get the 5 most recent available years, so we really just need to find the most recent and take that and the preceding 4.
   // so just do a simple call to get the us population for the years working backwards.
   let lookAgain = true
   recentYear = new Date().getFullYear() - 1 // start with last year, by definition there can't be a report for this year available

   while (lookAgain) {
      let urlPop = `${CB_BASE_URL}${recentYear}${CB_DATASET}B01003_001E&for=us${CB_API_KEY}`
      try {
         let resp = await axios.get(urlPop)
         lookAgain = false
      } catch (error) {
         recentYear--
         if (recentYear < new Date().getFullYear() - 5) {
            // we have a problem getting the data
            alert(
               'Unable to load reference information from the Census Bureau.'
            )
            return
         }
      }
   }

   // now that we know the recent year, we can refresh counties, which needs a year  before it can make the request.
   refreshCounties(document.getElementById('selectState').value)

   // now populate our reportType selector
   const reportSelectType = document.getElementById('selectReportType')
   for (i = 0; i < 5; i++) {
      let newYear = document.createElement('option')
      newYear.innerText = `Single Year Reports for ${String(recentYear - i)}`
      newYear.value = recentYear - i
      reportSelectType.add(newYear)
   }
   let newReportType = document.createElement('option')
   newReportType.innerText = 'Trend Reports (most recent 5 years)'
   newReportType.value = 'trend'
   reportSelectType.add(newReportType)

   // we start with single year reports selected for the current year
   reportSelectType.selectedIndex = 0
   reportTypeTrend = false
   refreshReportSelection()

   // set up the handler for the reportType selector
   reportSelectType.addEventListener('change', (e) => {
      // we only need to do something here if the trend type changes, not if we change within a trend type
      const newTrend = e.target.value === 'trend'
      if (reportTypeTrend != newTrend) {
         reportTypeTrend = newTrend
         refreshReportSelection()
      }
   })

   document.getElementById('selectReport').addEventListener('change', (e) => {
      reportList.addFilter(
         e.target.options[e.target.selectedIndex].innerText,
         e.target.value
      )
   })

   // handlers for the generate and clear reports buttons
   document
      .getElementById('btnGenerate')
      .addEventListener('click', generateReports)

   document.getElementById('btnClear').addEventListener('click', (e) => {
      const divReportDisplay = document.getElementById('divReportDisplay')
      while (divReportDisplay.children.length)
         divReportDisplay.lastChild.remove()
      reportList.clearList()
      enableCopyButton(false)
   })

   // also for the copy button
   document.getElementById('btnCopy').addEventListener('click', () => {
      let range = document.createRange()
      range.selectNodeContents(document.querySelector('#divReportDisplay'))

      let selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)

      document.execCommand('copy')
      selection.removeAllRanges()

      alert('All generated reports have been copied to the Clipboard!')
   })
   enableCopyButton(false)
}

const enableCopyButton = (enableFlag) => {
   document.getElementById('btnCopy').disabled = !enableFlag
}

const setupGeoFilters = () => {
   // load our state list and set up the event listeners & handlers for the county & zip filters

   const selectState = document.getElementById('selectState')

   selectState.addEventListener('change', (e) =>
      refreshCounties(e.target.value)
   )

   STATES.forEach((e) => {
      let newState = document.createElement('option')
      newState.innerText = e.name
      newState.value = e.id
      selectState.add(newState)
   })
   selectState.selectedIndex = 0

   document.getElementById('selectCounty').addEventListener('change', () => {
      countyList.addFilter(
         selectCounty.options[selectCounty.selectedIndex].innerText,
         selectCounty.value
      )
   })

   document.getElementById('btnZip').addEventListener('click', () => {
      const textZip = document.getElementById('textZip')
      if (textZip.value != '') validateZip(textZip.value)
   })
}

const refreshCounties = async (state) => {
   let urlCounty = `${CB_BASE_URL}${recentYear}${CB_DATASET}NAME&for=county:*&in=state:${state}${CB_API_KEY}`
   try {
      let resp = await axios.get(urlCounty)
      // clear the list
      selectCounty.length = 0

      // result will be an array with each element in the form
      // [ name, stateID, countyID ]
      // ex: [ "Falls Church city, Virginia", "51", "610" ]
      let myCounties = resp.data
      myCounties.shift() // first item returned is the header row, so remove it
      myCounties.sort((a, b) => (a[0] < b[0] ? -1 : 1))
      myCounties.forEach((e, i) => {
         let newCounty = document.createElement('option')
         newCounty.innerText = e[0].substring(0, e[0].indexOf(','))
         newCounty.value = e[2]
         selectCounty.add(newCounty)
      })
   } catch (error) {
      console.log(`Error trying to get Counties. ${error}`)
   }

   selectCounty.selectedIndex = -1
   countyList.clearList()
   zipList.clearList()
}

const validateZip = async (zip) => {
   try {
      const resp = await axios.get(`${ZIP_URL}${zip}`)
      const curState = selectState.options[selectState.selectedIndex].innerText

      if (resp.data.places[0].state === curState) {
         zipList.addFilter(zip, zip)
         textZip.value = ''
      } else {
         alert(`${textZip.value} is not in ${curState}`)
      }
      textZip.focus()
   } catch (error) {
      // a 404 here probably means the zip code doesn't exist
      if (error.message.indexOf('404') >= 0) {
         alert(`${textZip.value} is not a valid zip code.`)
         textZip.value = ''
         textZip.focus()
      } else console.log(error)
   }
}

class FilterList {
   constructor(itemType, sortAsc = true) {
      this._itemType = itemType
      this._filterList = []
      this._divList = document.getElementById(`${this._itemType}List`)
      this._sortAsc = sortAsc
   }

   get filterList() {
      return this._filterList
   }

   clearDisplay() {
      while (this._divList.firstChild) this._divList.firstChild.remove()
   }

   removeItem(that, value) {
      // find the value in my _filterList and remove it.
      that._filterList = that._filterList.filter((e) => e.name != value)
      this.updateDisplay()
   }

   updateDisplay() {
      this.clearDisplay()
      // clear and refresh the display list for this geo type
      this._filterList.forEach((filter) => {
         let newItem = document.createElement('div')
         newItem.innerText = filter.name
         newItem.className = `areaItem ${this._itemType}Item`
         newItem.dataset.itemType = this.itemType
         newItem.addEventListener('click', (e) => {
            let that = this
            this.removeItem(that, e.target.innerHTML)
         })
         this._divList.append(newItem)
      })
      checkGenerateButton()
   }

   clearList() {
      this._filterList.length = 0
      this.updateDisplay()
   }

   addFilter(displayText, value) {
      let newFilter = { name: displayText, filterID: value }

      // use a reduce to see if this value is already in there
      if (
         !this._filterList.reduce((isThere, e) => {
            return isThere || newFilter.filterID === e.filterID
         }, false)
      ) {
         this._filterList.push(newFilter)
         // sort the list for display
         if (this._sortAsc)
            this._filterList.sort(
               (a, b) => parseInt(a.filterID) - parseInt(b.filterID)
            )
         else
            this._filterList.sort(
               (a, b) => parseInt(b.filterID) - parseInt(a.filterID)
            )
         this.updateDisplay()
      }
   }

   get hasFilters() {
      return this._filterList.length > 0
   }
}

class Report {
   constructor(reportDefinition) {
      this._name = reportDefinition.name
      this._fields = reportDefinition.fields // fields is an array of objects [ { name: 'Total Population', code: 'B01003_001E', type: 'number' }, {...}, ... ]
      this._isTrend = reportDefinition.isTrend // trend report should have only one field and will be applied to multiple years
      this._results = []
      this._resultCount = 0
      this._countyFilters = []
      this._zipFilters = []
      this._state = document.getElementById('selectState').value
   }

   addFilters = (filters, type) => {
      if (type === 'county') this._countyFilters = filters
      // an array of filter objects, of the form { name: , filterID: , type: [county|zip] }
      else this._zipFilters = filters
   }

   headerRow = () => {
      let header = ['Geographic Area']
      if (this._isTrend)
         for (let i = 0; i < 5; i++) header.push(String(recentYear - (4 - i)))
      else this._fields.forEach((e) => header.push(e.name))

      return header
   }

   displayResultsAsTable(results) {
      let newTable = document.createElement('table')
      newTable.classList = 'reportTable'
      newTable.id = 'table1'
      // report title
      let titleRow = document.createElement('tr')
      let titleCell = document.createElement('td')
      titleCell.innerText = this._name
      titleCell.colSpan = results[0].length
      titleCell.className = 'divTableTitle'

      titleRow.append(titleCell)
      newTable.append(titleRow)

      // put the data in the table
      results.forEach((resRow, index) => {
         let newRow = document.createElement('tr')
         newRow.style.padding = '0px'
         resRow.forEach((e, index2) => {
            let newCell = document.createElement('td')

            if (index === 0)
               newCell.className = 'reportTableCell divTableHeader'
            else if (index === results.length - 1) {
               newCell.className = 'reportTableCell divTableSummary'
            } else newCell.className = 'reportTableCell'

            if (index2 === 0) newCell.classList.add('reportTableFirst')

            newCell.innerText = e

            newRow.appendChild(newCell)
         })
         newTable.append(newRow)
      })

      document.querySelector('#divReportDisplay').append(newTable)
      const blankRow = document.createElement('div')
      blankRow.innerHTML = '<br>'
      document.querySelector('#divReportDisplay').append(blankRow)
   }

   displayResults(results) {
      let tableDiv = document.createElement('div')

      tableDiv.className = 'divTable'
      tableDiv.style.gridTemplateColumns = '1fr '.repeat(results[0].length)
      // give the report a title
      let newTitle = document.createElement('div')
      newTitle.className = 'divTableTitle'
      newTitle.innerText = this._name
      newTitle.style.gridColumn = `span ${results[0].length}`
      tableDiv.appendChild(newTitle)

      // put the data in the table
      results.forEach((resRow, index) => {
         resRow.forEach((e, index2) => {
            let newDiv = document.createElement('div')
            if (index === 0) newDiv.className = 'divTableCell divTableHeader'
            else if (index === results.length - 1) {
               newDiv.className = 'divTableCell divTableSummary'
            } else newDiv.className = 'divTableCell'

            if (index2 === 0) newDiv.classList.add('divTableFirst')

            newDiv.innerText = e

            tableDiv.appendChild(newDiv)
         })
      })

      document.querySelector('#divReportDisplay').append(tableDiv)
   }

   processResults = () => {
      if (this._resultCount != this._results.length) return

      // If we're here, then all the parallel field requests for this report have been processed

      this._results.sort((a, b) => {
         if (a.type === b.type) {
            return a.year < b.year ? -1 : 1
         } else {
            // sort by type
            return a.type < b.type ? -1 : 1
         }
      })

      // at this point, _results is sorted by type (county, zip, zState), year (only meaningful for _isTrend), and then the first field of the result, which should be the geo area.
      // if it's an _isTrend, we need to transpose the years into columns.
      // otherwise we basically have the report table.
      let resultTable = []
      let offset = 0
      if (this._isTrend) {
         console.log(this._results)
         let lastType = ''
         this._results.forEach((qry) => {
            if (lastType != qry.type) {
               // first of this type, so lets create new rows
               offset = resultTable.length

               qry.data.forEach((e) => {
                  let newArr = [e[0]]
                  resultTable.push(newArr)
               })

               lastType = qry.type
            }

            qry.data.forEach((e, index) => {
               // e is a row (array) of result data.
               // tag the results with field types, and we might have a percent to process, which uses two fields
               // +== in the future, we could have a percent with a multi-code numerator, need to support that.

               // for trend reports, we essentially have only one column to build, so all data that is not the first or last two columns is fair game.
               const field = this._fields[0]
               let res = ''
               let sum = 0
               let den = 0
               let fieldCount = e.length - 3
               // default behavior should be for a 'number', or 'decimal', it should behave the same as a sum, but there will only be one data value
               let sumEnd = fieldCount
               let denStart = 1
               if (field.type === 'percent' || field.type === 'sumPct') {
                  // we're calucating a pct of some kind
                  if ('numeratorCnt' in field) {
                     numEnd = field.numeratorCnt // numerator is a fixed count of fields
                     denStart = 1 // denominator is sum of all fields.
                  } else {
                     sumEnd = fieldCount - 1 // numerator is sum of all fields but last
                     denStart = fieldCount // denominator is the last field
                  }
               }
               for (let i = 1; i <= fieldCount; i++) {
                  if (sumEnd >= i) {
                     sum += parseInt(e[i])
                  }
                  if (denStart <= i) {
                     den += parseInt(e[i])
                  }
               }

               if (field.type === 'number' || field.type === 'decimal' || field.type === 'sum') {
                  res = sum.toLocaleString()
               } else if (den > 0) {
                  const sumPct = ((100 * sum) / den).toFixed(1)
                  if (field.type === 'percent') {
                     res = sumPct
                  } else if (field.type === 'sumPct') {
                     res = `${parseInt(sum).toLocaleString()} (${sumPct}%)`
                  }
               } else {
                  res = 'n/a'
               }

               resultTable[index + offset].push(res)
            })
         })
      } else {
         // non trend table
         // for the moment, assume simple data
         this._results.forEach((qry) => {
            // e is a query result.  e.data is an array of arrays
            qry.data.forEach((e) => {
               // in this case, lets walk them using the fields.
               // first value will be the geo name
               let newArr = [e[0]]
               let fieldOffset = 0
               this._fields.forEach((field) => {
                  fieldOffset++
                  // deal with percentage here.
                  if (field.type === 'percent' || field.type === 'sumPct') {
                     //  this._fields.code will have multiple comma separated entries,
                     // the default behavior for percentages (if numeratorCnt is not defined) is that the last is the divisor, all others should be totaled for the numerator
                     // if numeratorCnt exists, then the first numeratorCnt values are totaled for the numerator and ALL values are totalled for the denominator
                     let sum = 0
                     let den = 0
                     let fieldCount = field.code.split(',').length
                     let numEnd = fieldOffset + fieldCount - 2
                     let denStart = fieldOffset + fieldCount - 1
                     if ('numeratorCnt' in field) {
                        numEnd = fieldOffset + field.numeratorCnt - 1
                        denStart = fieldOffset
                     }
                     while (fieldCount) {
                        if (fieldOffset <= numEnd) {
                           sum += parseInt(e[fieldOffset])
                        }
                        if (fieldOffset >= denStart) {
                           den += parseInt(e[fieldOffset])
                        }
                        fieldOffset++
                        fieldCount--
                     }
                     // if the denominator is 0, we don't want to show anything.
                     if (den > 0) {
                        let sumPct = ((100 * sum) / den).toFixed(1)
                        if (field.type === 'percent') newArr.push(`${sumPct}%`)
                        else {
                           newArr.push(
                              `${parseInt(sum).toLocaleString()} (${sumPct}%)`
                           )
                        }
                     } else newArr.push('n/a')
                     fieldOffset--
                  } else if (field.type === 'sum') {
                     // in this case this._fields.code will have multiple comma separated entries.
                     let sum = 0
                     let fieldCount = field.code.split(',').length
                     while (fieldCount) {
                        sum += parseInt(e[fieldOffset])
                        fieldOffset++
                        fieldCount--
                     }
                     fieldOffset-- // we incremented by as many as we used, but we want the counter to end on the last element we used.
                     newArr.push(parseInt(sum).toLocaleString())
                  } else if (field.type === 'number')
                     newArr.push(parseInt(e[fieldOffset]).toLocaleString())
                  else if (field.type === 'decimal')
                     newArr.push(
                        parseFloat(e[fieldOffset]).toFixed(1).toLocaleString()
                     )
                  else newArr.push(e[fieldOffset])
               })
               resultTable.push(newArr)
            })
         })
      }

      // build the header row and stick it on the front
      resultTable.unshift(this.headerRow())
      // this.displayResults ( resultTable )
      this.displayResultsAsTable(resultTable)
   }

   requestData = async (filterType, year) => {
      this._resultCount++

      // build the field string portion of the query:  "NAME,BO1003_001E" for instance
      let fieldString = 'NAME'
      this._fields.forEach((e) => (fieldString += `,${e.code}`))

      // build the geo filter string
      let geoString = '&for='

      if (filterType === 'zstate') {
         geoString = `&for=state:${this._state}`
      } else {
         let useState = true
         let whichFilters = null
         let stateString = ''
         stateString = `&in=state:${this._state}`

         if (filterType === 'county') {
            geoString += 'county:'
            // counties must be 3 digits
            whichFilters = this._countyFilters
         } else {
            // 'zip'
            geoString += 'zip%20code%20tabulation%20area:'
            whichFilters = this._zipFilters
            useState = year >= 2019
         }
         let isFirst = true
         whichFilters.forEach((e) => {
            geoString += `${isFirst ? '' : ','}${String(e.filterID)}`
            isFirst = false
         })
         if (useState) geoString += stateString
      }

      // for any year pre-2019, we need just zips.
      // for 2019+, we need state and zips.

      let myURL = `${CB_BASE_URL}${year}${CB_DATASET}${fieldString}${geoString}${CB_API_KEY}`
      console.log(myURL)
      try {
         let response = await axios.get(myURL)
         let respData = response.data
         respData.shift() // remove the "header" row
         // now sort it
         respData.sort((a, b) => (a[0] < b[0] ? -1 : 1))
         // if we did counties, we need to scrub the name which will be "Fairfax County, Virginia" to remove the state
         if (filterType === 'county')
            respData.forEach(
               (e, index) =>
                  (respData[index][0] = e[0].substring(0, e[0].indexOf(',')))
            )

         this._results.push({ type: filterType, year: year, data: respData })
         this.processResults()
      } catch (error) {
         console.log(`Error in requestData: ${error}`)
      }
   }

   runReports = () => {
      // for each geo filter type (county/zip), we're going to make the call once (for non-trend) or 5 times ( for trend )
      // additionally, we create a summary row for the state as a third type

      // so now walk the filter types
      this._results = []
      this._resultCount = 0

      for (let fType of ['county', 'zip', 'zstate']) {
         if (
            (fType === 'county' && this._countyFilters.length) ||
            (fType === 'zip' && this._zipFilters.length) ||
            fType === 'zstate'
         ) {
            if (this._isTrend) {
               for (let i = 0; i < 5; i++)
                  this.requestData(fType, recentYear - (4 - i))
            } else
               this.requestData(
                  fType,
                  document.getElementById('selectReportType').value
               )
         }
      }
   }
}

const refreshReportSelection = () => {
   const reportSelect = document.getElementById('selectReport')
   reportSelect.length = 0
   REPORTS.forEach((e, i) => {
      if (e.isTrend === reportTypeTrend) {
         let newReport = document.createElement('option')
         newReport.innerText = e.name
         newReport.value = i
         reportSelect.add(newReport)
      }
   })
   reportList.clearList()
   reportSelect.selectedIndex = -1
}

const checkGenerateButton = () => {
   // if we have no reports or we have no geo filters, we can't generate anything
   document.getElementById('btnGenerate').disabled =
      (!countyList.hasFilters && !zipList.hasFilters) || !reportList.hasFilters

   // the clear button should be active if we have reports selected in the filter or results generated
   document.getElementById('btnClear').disabled =
      !reportList.hasFilters &&
      !document.getElementById('divReportDisplay').children.length
}

const generateReports = () => {
   // this is where the magic happens!
   // each report will be executed once for each type of geo filter.  if it's a trend report, it will be executed once per year per filter type.

   // create an array of report instances
   const reports = []

   reportList.filterList.forEach((e) => {
      let newReport = new Report(REPORTS[e.filterID])
      if (countyList.hasFilters)
         newReport.addFilters(countyList.filterList, 'county')
      if (zipList.hasFilters) newReport.addFilters(zipList.filterList, 'zip')
      reports.push(newReport)
   })

   // request each report to go execute
   reports.forEach((e) => e.runReports())
   enableCopyButton(true)
}

const countyList = new FilterList('county')
const zipList = new FilterList('zip')
const reportList = new FilterList('report')

window.onload = () => {
   setupGeoFilters()
   setupReportSelection()
}
