import JobuKarendaa from '../jobu-karendaa';
import moment from 'moment';

// Current Month Test
let test = new JobuKarendaa(new moment(), { useIsoWeek: true });
let currentDate = new moment();
console.log('first work day of year: ' + test.firstWorkDay('year').format('YYYY-MM-DD HH:mm:ss'));
console.log('last work day of year: ' + test.lastWorkDay('year').format('YYYY-MM-DD HH:mm:ss'));
console.log('first work day of month: ' + test.firstWorkDay().format('YYYY-MM-DD HH:mm:ss'));
console.log('last work day of month: ' + test.lastWorkDay().format('YYYY-MM-DD HH:mm:ss'));
console.log('next work month: ' + test.next().current().format('YYYY-MM-DD HH:mm:ss'));
console.log('previous work month: ' + test.previous().current().format('YYYY-MM-DD HH:mm:ss'));

// Test overlap dates
for(let i = 1; i < 8; ++i) {
   test = new JobuKarendaa(moment().year(2017).month(2).date(i));
   console.log('overlay time: ' + test.current().format('YYYY-MM-DD'));
   console.log('current month: ' + test.workMonth());
}

// Testing the work month setter/getter
console.log('workMonth-----------------------------');
for(let i = 0; i < 12; ++i) {
   test = new JobuKarendaa(new moment().month(i).date(15));
   console.log('date: ' + test.workMonth(i).current().format('YYYY-MM-DD HH:mm:ss'));
}

// Testing next: year
console.log('next: year----------------------------');
test = new JobuKarendaa().next('year');
let lastWorkDayOfYear = test.lastWorkDay('year');
while(lastWorkDayOfYear.diff(test.current()) > 0) {
   console.log('date: ' + test.current().format('YYYY-MM-DD HH:mm:ss'));
   test.next('workmonth');
} 

// Testing on the previous year
// [TODO] [BROKEN]
console.log('previous: year------------------------');
lastWorkDayOfYear = new JobuKarendaa().workYear(moment().year() - 1).lastWorkDay('year');
test = new JobuKarendaa(lastWorkDayOfYear);
console.log('previous month: ' + test.current().format('YYYY-MM-DD'))
let firstWorkDayOfYear = test.firstWorkDay('year');
console.log('firstWorkDay: ' + firstWorkDayOfYear.format('YYYY-MM-DD'))
while(test.current().diff(firstWorkDayOfYear, 'hours') >= -23) {
   console.log('date: ' + test.current().format('YYYY-MM-DD HH:mm:ss'));
   test.previous('workmonth');
}

// Testing the print outs per week
let workCalendar = new JobuKarendaa(),
   endYear = workCalendar.lastWorkDay('year');
console.log('Work Month test:----------------------');
workCalendar.workMonth(0);
while(endYear.diff(workCalendar.current(), 'hours') > 0) {
   console.log(workCalendar.workWeek('year') + ': ' + workCalendar.workMonth() + ', ' + workCalendar.workWeek('month') + ', ' + workCalendar.firstWorkDay('week').format('MM-DD') + ' => ' + workCalendar.lastWorkDay('week').format('MM-DD'))
   workCalendar.next('workweek');
}