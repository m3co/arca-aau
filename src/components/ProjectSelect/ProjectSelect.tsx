import React from 'react';
import get from 'lodash/get';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import './ProjectSelect.less';

interface ProjectSelectProps {
  currentProject: number,
  onChange: (event: React.ChangeEvent<{ name?: string, value: unknown, }>) => void,
  options: Array<{ name?: number | string; value: number }>,
}

const ProjectSelect: React.FunctionComponent<ProjectSelectProps> = ({
  currentProject, onChange, options,
}) => {
  const currentOption = options.find(option => option.value === currentProject);

  return (
    <div className='gantt-project-select'>
      <Select
        value={get(currentOption, 'value', '')}
        onChange={onChange}
        inputProps={{
          name: 'project',
          id: 'project',
        }}
        displayEmpty
        renderValue={selected => {
          if ((selected as null) === '') {
            return <em className='gantt-project-select__placeholder'>Project</em>;
          }

          return get(currentOption, 'name', '');
        }}
      >
        <MenuItem disabled value=''>
          <em>Project</em>
        </MenuItem>
        {
          options.map(project => (
            <MenuItem key={String(project.value)} value={project.value}>{ project.name || project.value }</MenuItem>
          ))
        }
      </Select>
    </div>
  );
};

export default ProjectSelect;
