Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSkeleton = void 0;
const material_1 = require("@mui/material");
const styles_1 = require("@mui/material/styles");
const SkeletonContainer = (0, styles_1.styled)("div")(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));
const SkeletonRow = (0, styles_1.styled)("div")({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});
const LoadingSkeleton = () => {
  return (
    <SkeletonContainer>
      {[...Array(5)].map((_, index) => (
        <SkeletonRow key={index}>
          <material_1.Skeleton variant="circular" width={40} height={40} />
          <material_1.Skeleton variant="rectangular" width="30%" height={40} />
          <material_1.Skeleton variant="rectangular" width="20%" height={40} />
          <material_1.Skeleton variant="rectangular" width="15%" height={40} />
          <material_1.Skeleton variant="rectangular" width="15%" height={40} />
        </SkeletonRow>
      ))}
    </SkeletonContainer>
  );
};
exports.LoadingSkeleton = LoadingSkeleton;
//# sourceMappingURL=LoadingSkeleton.js.map
