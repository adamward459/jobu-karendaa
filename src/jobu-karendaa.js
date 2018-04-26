/*!
 * \file jobu-karendaa.js
 * \author Kevin Ngo
 * \email kevin.ngo@hidesigns.co.jp
 * \license WTFPL
 */
import moment from 'moment'

/*!
 * \class JobuKarendaa
 * 
 */
class JobuKarendaa {
   /*!
    * A wrapped moment object to calculate dates on a specified date. By default, isoweek is used.
    * \param mmtDate The Moment object to copy and use as reference.
    * \param options current field: useIsoWeek.
    */
   constructor(mmtDate, options) {
      this.mmtDate = moment();
      this.useIsoWeek = true;
      switch(arguments.length) {
      case 2:
         if(mmtDate === undefined && options === undefined)
            break;
         if(!(mmtDate instanceof moment)) {
            let year = mmtDate.hasOwnProperty('year') ? mmtDate.year : this.mmtDate.year();
            let month = mmtDate.hasOwnProperty('month') ? mmtDate.month : 0;
            this.mmtDate.year(year).month(month);
            this.mmtDate = this.firstWorkDay();
         } else {
            this.mmtDate = mmtDate.clone();
         }
         this.useIsoWeek = options.hasOwnProperty('useIsoWeek') ? options.useIsoWeek === true : true;
         break;
      case 1:
         this.mmtDate = mmtDate.clone();
         break;
      case 0:
      default:
         break;
      }
   }
   /*!
    * Get the first working day of the specified month or year
    * \param units (year|years)|(month|months)|(workweek|week|weeks)
    * \return Moment object specifying the first work day of the specified units.
    */
   firstWorkDay(units) {
      let result = null;
      let startOfWorkMonth = null;
      switch(units) {
      case 'workweek':
      case 'week':
      case 'weeks':
         result = this.mmtDate.clone().startOf(this.getWeekType()).startOf(this.getWeekType());
         break;
      case 'year':
      case 'years':
         startOfWorkMonth = this.mmtDate.clone().startOf('year').startOf(this.getWeekType());
         // First
         //console.log('first: ' + startOfWorkMonth.format('YYYY-MM-DD'))
         if(this.mmtDate.month() === 0) {
            startOfWorkMonth = this.firstWorkDay();
            //console.log('second: ' + startOfWorkMonth.format('YYYY-MM-DD'))
            // When startOfMonth is ahead of the date in question
            if(startOfWorkMonth.diff(this.mmtDate, 'hours') > 0) {
               // Fallback to last year
               startOfWorkMonth.subtract(182, 'days');
               //console.log('second.a: ' + startOfWorkMonth.format('YYYY-MM-DD'))
               startOfWorkMonth.startOf('year').startOf(this.getWeekType());
               //console.log('third: ' + startOfWorkMonth.format('YYYY-MM-DD'))
            }
         } else {
            // Offset to Jan 1 to the 1st day of the specified week
            startOfWorkMonth = this.mmtDate.clone().startOf('year').startOf(this.getWeekType());
            //console.log('second.2: ' + startOfWorkMonth.format('YYYY-MM-DD'))
         }
         // Forward 1 week if in the month of December
         if(startOfWorkMonth.month() === 11)
            startOfWorkMonth.add(1, 'week');
         //console.log('fourth: ' + startOfWorkMonth.format('YYYY-MM-DD'))
         result = startOfWorkMonth;
         break;
      case 'month':
      case 'months':
      // always default to the month
      default:
         // [TODO] Optimize
         startOfWorkMonth = this.mmtDate.clone().startOf('month').startOf(this.getWeekType()).hours(0).minutes(0).seconds(0);
         if(startOfWorkMonth.date() > 7)
            startOfWorkMonth.add(1, 'week')
         if(startOfWorkMonth.diff(this.mmtDate, 'hours') > 0) {
            startOfWorkMonth.subtract(1, 'month').startOf('month').startOf(this.getWeekType())
            if(startOfWorkMonth.date() > 7)
               startOfWorkMonth.add(1, 'week')
         }
         result = startOfWorkMonth;
      }
      return result.clone().hours(0).minutes(0).seconds(0);
   }
   /*!
    * Get the last working day of the specified month or year
    * \param units (year|years)|(month|months)|(workweek|week|weeks)
    * \return Moment object specifying the last work day of the specified units.
    */
   lastWorkDay(units) {
      let result = null;
      switch(units) {
      case 'workweek':
      case 'week':
      case 'weeks':
         result = this.mmtDate.clone().endOf('week').endOf(this.getWeekType());
         break;
      case 'year':
      case 'years':
         result = this.mmtDate.clone().endOf('year').endOf(this.getWeekType());
         break;
      case 'month':
      case 'months':
      // always default to the month
      default:
         let endOfMonth = this.mmtDate.clone().endOf('month');
         // If the end of the month ends on a Sunday, use as result, else get the start of the week and 6 days
         result = (endOfMonth.day() === 0) ? endOfMonth : endOfMonth.startOf(this.getWeekType()).add(6, 'days');
      }
      return result.hours(23).minutes(59).seconds(59);
   }
   /*!
    * Sets to the specified work year.
    * \param val The optional year value to set as.
    * \return If val is set, returns itself after modification, else returns the year value.
    */
   workYear(val) {
      // Get
      if(arguments.length == 0)
         return this.mmDate.year();
      // Set
      this.mmtDate.year(val);
      return this;
   }
   /*!
    * Sets the specified work month. Valid values are integers in the inclusive interval [0, 11]
    * \param val 
    * \return
    */
   workMonth(val) {
      // Get
      if(arguments.length == 0) {
         return this.firstWorkDay().month();
      }
      // Set
      //console.log('work.month: ' + this.mmtDate.format('YYYY-MM-DD'))
      let month = new JobuKarendaa(this.firstWorkDay('year'), { useIsoWeek: this.useIsoWeek }), 
         i =0;
      while(i < val) {
         //console.log('month.date: ' + month.current().format('YYYY-MM-DD'))
         month.next('month');
         ++i;
      }
      this.mmtDate = month.current().clone();
      //console.log('this.mmtDate: ' + this.mmtDate.format('YYYY-MM-DD'))
      return this;
   }
   /*!
    * Sets the current work week
    * \param val Sets the week based on
    * \param units Set week by terms by year or month
    * \return Integer specifying the current work week
    */
   workWeek(val, units) {
      let result = null;
      switch(arguments.length) {
      // Get
      case 0:
         break;
      case 1:
         // assume units
         switch(arguments[0]){
         case 'year':
         case 'years':
            result = this.mmtDate.diff(this.firstWorkDay('year'), 'weeks') + 1;
            break;
         case 'month':
         case 'months':
            result = this.mmtDate.diff(this.firstWorkDay(), 'weeks') + 1;
            break;
         }
         break;
      // Set
      case 2:
         switch(units) {
         case 'year':
         case 'years':
            this.mmtDate = this.firstWorkDay('year').add(val - 1, 'weeks');
            break;
         case 'month':
         case 'months':
            this.mmtDate = this.firstWorkDay().add(val - 1, 'weeks')
            break;
         }
         result = this;
         break;
      default:
         break;
      }
      return result;
   }
   /*!
    * Get the number of weeks based on the specified units.
    * \param units (year|years)|(month|months)|(workweek|week|weeks)
    * \return Integer specifying the number of weeks based on the specified units.
    */
   weeksCount(units) {
      let result = null;
      switch(units) {
      case 'workweek':
      case 'week':
      case 'weeks':
         result = 1;
         break;
      case 'year':
      case 'years':
         result = this.mmtDate.clone().month(0).startOf(this.getWeekType()).diff(this.lastWorkDay(), 'weeks');
         break;
      case 'month':
      case 'months':
      default:
         let firstDay = this.firstWorkDay(), lastDay = this.lastWorkDay().add(1, 'days');
         result = lastDay.diff(firstDay, 'weeks');
      }
      return result;
   }
   /*!
    * Internal function to check to use isoweek or regular week rule for momentjs.
    */
   getWeekType() {
      return (this.useIsoWeek) ? 'isoweek' : 'week';
   }
   current(units) {
      let result = this.mmtDate.clone();
      switch(units) {
      case 'workweek':
         result = this.workWeek(units);
         break;
      case 'year':
      case 'years':
         result = this.mmtDate.year();
         break;
      case 'month':
      case 'months':
         result = this.mmtDate.month();
         break;
      case 'workmonth':
         result = this.firstWorkDay('month').month();
         break;
      default:
      }
      return result;
   }
   /*!
    * Jump to the next start of month or year.
    * \param units (year|years)|(month|months)|(workweek|week|weeks)
    * \return Moment object specifying the next month or year.
    */
   next(units) {
      let mmtUnitType = null, unitType = units;
      if(arguments.length == 0) {
         unitType = 'month';
      }
      this.mmtDate = this.lastWorkDay(unitType).add(1, 'days').hours(0).minutes(0).seconds(0);
      return this;
   }
   /*!
    * Jump to the previous start of month or year. Default jump unit is months
    * \param units (year|years)|(month|months)|(workweek|week|weeks)
    * \return Moment object specifying the previous month or year.
    */
   previous(units) {
      let mmtUnitType = null, unitType = units;
      if(arguments.length == 0) {
         unitType = 'month';
         mmtUnitType = 'month';
      } else {
         switch(units) {
         case 'workweek':
            mmtUnitType = 'week';
            break;
         case 'workmonth':
            mmtUnitType = 'month'
            break;
         default:
            mmtUnitType = units;
         }
      }
      //console.log('previous@current: ' + this.mmtDate.format('YYYY-MM-DD'))
      //console.log('previous@firstWorkDay: ' + this.firstWorkDay(unitType).format('YYYY-MM-DD'))
      this.mmtDate = this.firstWorkDay(unitType).subtract(1, mmtUnitType);
      //console.log('previous@subtractionByFirst: ' + this.mmtDate.format('YYYY-MM-DD'))
      return this;
   }
}

export default JobuKarendaa;