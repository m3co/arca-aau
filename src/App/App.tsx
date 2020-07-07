import React, { useEffect, useState } from 'react';
import { Store } from 'redux';
import { useSelector } from 'react-redux';
import { getSpecificSource, State } from 'arca-redux-v4';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { socket } from '../redux/store';
import Tree from '../components/Tree/Tree';
import ProjectSelect from '../components/ProjectSelect/ProjectSelect';

const useStyles = makeStyles({
  topBarWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
  },
  main: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 42,
  },
  title: {
    marginRight: 42,
  },
});

const App: React.FunctionComponent = () => {
  const classes = useStyles();
  const projects: State['Source']['Projects'] = useSelector((state: Store) => getSpecificSource(state, 'Projects'));
  const tree = useSelector((state: Store) => getSpecificSource(state, 'AAU-Concretize'));

  const [curProject, setCurProject] = useState(0);

  useEffect(() => {
    socket.select('Projects');
  }, []);

  useEffect(() => {
    if (curProject > 0) {
      socket.select('AAU-Concretize', {
        Project: curProject,
      });
    }
  }, [curProject]);

  const setCurrentProject = (event: React.ChangeEvent<{ name?: string, value: unknown, }>) => {
    setCurProject(Number(event.target.value));
  };

  const projectOptions = projects.map(project => ({
    value: project.ID,
    name: project.Name,
  }));

  return (
    <div className='page'>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.topBarWrap}>
          <Typography className={classes.title} variant='h5' component='h1'>
            Arca Tree
          </Typography>
          <ProjectSelect currentProject={curProject} onChange={setCurrentProject} options={projectOptions} />
        </Grid>
        <Grid item xs={12} className={classes.main}>
          { tree && tree.length ? <Tree treeItems={tree} /> : null }
        </Grid>
      </Grid>
    </div>
  );
};

export default App;
