import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

const SkeletonContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SkeletonRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const LoadingSkeleton: React.FC = () => {
  return (
    <SkeletonContainer>
      {[...Array(5)].map((_, index) => (
        <SkeletonRow key={index}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width="30%" height={40} />
          <Skeleton variant="rectangular" width="20%" height={40} />
          <Skeleton variant="rectangular" width="15%" height={40} />
          <Skeleton variant="rectangular" width="15%" height={40} />
        </SkeletonRow>
      ))}
    </SkeletonContainer>
  );
};
