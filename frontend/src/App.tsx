import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import MainLayout from '@/layouts/MainLayout'
import PublicLayout from '@/layouts/PublicLayout'
import DatasetList from '@/pages/business/DatasetList'
import DatasetDetail from '@/pages/business/DatasetDetail'
import FieldEditor from '@/pages/business/FieldEditor'
import ReviewList from '@/pages/dataoffice/ReviewList'
import ReviewDetail from '@/pages/dataoffice/ReviewDetail'
import WindowManagement from '@/pages/admin/WindowManagement'
import PublicDatasetList from '@/pages/public/DatasetList'
import PublicDatasetDetail from '@/pages/public/DatasetDetail'
import RoleSwitch from '@/components/RoleSwitch'

function App() {
  const { role } = useUserStore()

  return (
    <div className="app">
      <RoleSwitch />
      <Routes>
        <Route path="/public" element={<PublicLayout />}>
          <Route index element={<Navigate to="datasets" replace />} />
          <Route path="datasets" element={<PublicDatasetList />} />
          <Route path="datasets/:id" element={<PublicDatasetDetail />} />
        </Route>

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="datasets" replace />} />

          {role === 'BUSINESS' && (
            <>
              <Route path="datasets" element={<DatasetList />} />
              <Route path="datasets/:id" element={<DatasetDetail />} />
              <Route path="datasets/:id/fields" element={<FieldEditor />} />
            </>
          )}

          {role === 'DATA_OFFICE' && (
            <>
              <Route path="reviews" element={<ReviewList />} />
              <Route path="reviews/:id" element={<ReviewDetail />} />
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <Route path="datasets" element={<DatasetList />} />
              <Route path="datasets/:id" element={<DatasetDetail />} />
              <Route path="reviews" element={<ReviewList />} />
              <Route path="reviews/:id" element={<ReviewDetail />} />
              <Route path="windows" element={<WindowManagement />} />
            </>
          )}
        </Route>
      </Routes>
    </div>
  )
}

export default App
