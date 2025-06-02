import type React from "react"
import { Box, Card, CardContent, Typography } from "@mui/material"

interface UserSummaryCardsProps {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  uniqueUserTypes: number
}

const UserSummaryCards: React.FC<UserSummaryCardsProps> = ({
  totalUsers,
  adminUsers,
  regularUsers,
  uniqueUserTypes,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2,
        mb: 3,
      }}
    >
      <Card variant="outlined">
        <CardContent sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            {totalUsers}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Users
          </Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h4" color="error.main" fontWeight="bold">
            {adminUsers}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin Users
          </Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h4" color="success.main" fontWeight="bold">
            {regularUsers}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Regular Users
          </Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h4" color="info.main" fontWeight="bold">
            {uniqueUserTypes}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User Types
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UserSummaryCards
