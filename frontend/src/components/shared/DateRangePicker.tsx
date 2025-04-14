import { Control, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  control: Control<any>;
  startName: string;
  endName: string;
  label: string;
}

export const DateRangePicker = ({
  control,
  startName,
  endName,
  label
}: DateRangePickerProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name={startName}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              selected={value}
              onChange={onChange}
              selectsStart
              startDate={value}
              endDate={control._getWatch(endName)}
              minDate={new Date()}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholderText="Start Date"
            />
          )}
        />
        <Controller
          control={control}
          name={endName}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              selected={value}
              onChange={onChange}
              selectsEnd
              startDate={control._getWatch(startName)}
              endDate={value}
              minDate={control._getWatch(startName)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholderText="End Date"
            />
          )}
        />
      </div>
    </div>
  );
}; 