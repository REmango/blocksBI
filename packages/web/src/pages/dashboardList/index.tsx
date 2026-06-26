import { useCallback, useEffect, useState } from 'react'
import { Button, Empty, Spin, Table, message } from 'antd'
import { DashboardOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'
import type { ColumnsType } from 'antd/es/table'

import {
  createDashboard,
  fetchDashboardList,
  type DashboardListItem,
} from '@/api/dashboard'

function formatDateTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const DashboardListPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dashboards, setDashboards] = useState<DashboardListItem[]>([])

  const loadDashboards = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchDashboardList()
      setDashboards(list)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载看板列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboards()
  }, [loadDashboards])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const result = await createDashboard()
      message.success('看板已创建')
      navigate(`/${result.dashboardId}`)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '创建看板失败')
    } finally {
      setCreating(false)
    }
  }

  const columns: ColumnsType<DashboardListItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium text-slate-100">{name}</span>
      ),
    },
    {
      title: '画布数',
      dataIndex: 'pageCount',
      key: 'pageCount',
      width: 88,
    },
    {
      title: '组件数',
      dataIndex: 'componentCount',
      key: 'componentCount',
      width: 88,
    },
    {
      title: '尺寸',
      key: 'size',
      width: 120,
      render: (_, record) => `${record.canvasWidth} × ${record.canvasHeight}`,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 72,
      render: (version: number) => `v${version}`,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 96,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => navigate(`/${record.dashboardId}`)}>
          打开
        </Button>
      ),
    },
  ]

  return (
    <div className="dashboard-list-page min-h-screen bg-[#181a1b] text-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-100">
            <DashboardOutlined />
            <span>看板列表</span>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={() => void loadDashboards()} loading={loading}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={creating}
              onClick={() => void handleCreate()}
            >
              新建看板
            </Button>
          </div>
        </div>

        <div className="dashboard-list-table rounded-lg border border-[#334155] bg-[#1e2122] p-4">
          <Spin spinning={loading}>
            <Table
              rowKey="dashboardId"
              columns={columns}
              dataSource={dashboards}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: <Empty description="暂无看板，点击右上角新建" /> }}
              onRow={(record) => ({
                onClick: () => navigate(`/${record.dashboardId}`),
                className: 'cursor-pointer',
              })}
            />
          </Spin>
        </div>
      </div>
    </div>
  )
}

export default DashboardListPage
