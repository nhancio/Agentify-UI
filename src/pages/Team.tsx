import React from 'react';
import Sidebar from '../components/Sidebar';
import { Users, BarChart3, User, Mail, PieChart } from 'lucide-react';

const teamMembers = [
	{
		id: 1,
		name: 'Alice Johnson',
		email: 'alice@company.com',
		role: 'Admin',
		usage: { agents: 3, calls: 1200, quota: 2000 },
	},
	{
		id: 2,
		name: 'Bob Smith',
		email: 'bob@company.com',
		role: 'Member',
		usage: { agents: 2, calls: 800, quota: 1500 },
	},
	{
		id: 3,
		name: 'Carol Lee',
		email: 'carol@company.com',
		role: 'Member',
		usage: { agents: 1, calls: 400, quota: 1000 },
	},
];

const Team: React.FC = () => {
	return (
		<div className="flex">
			<Sidebar />
			<div className="ml-64 flex-1 p-8 pt-24">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
						<Users className="w-7 h-7 mr-2 text-blue-600" />
						Team Management
					</h1>
					<p className="text-gray-600">
						Manage your team members, roles, and usage quotas.
					</p>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200">
					<div className="p-6 border-b border-gray-200 flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900 flex items-center">
							<BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
							Team Members
						</h2>
						<button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-medium">
							Invite Member
						</button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-100">
									<th className="py-3 px-6">User</th>
									<th className="py-3 px-6">Email</th>
									<th className="py-3 px-6">Role</th>
									<th className="py-3 px-6">Agents</th>
									<th className="py-3 px-6">Calls Used</th>
									<th className="py-3 px-6">Quota</th>
									<th className="py-3 px-6">Usage</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{teamMembers.map((member) => (
									<tr key={member.id} className="hover:bg-gray-50">
										<td className="py-4 px-6 flex items-center">
											<User className="w-5 h-5 text-blue-500 mr-2" />
											<span className="font-medium text-gray-900">
												{member.name}
											</span>
										</td>
										<td className="py-4 px-6 flex items-center">
											<Mail className="w-4 h-4 text-gray-400 mr-2" />
											<span className="text-gray-700">
												{member.email}
											</span>
										</td>
										<td className="py-4 px-6">
											<span
												className={`px-2 py-1 text-xs font-semibold rounded-full ${
													member.role === 'Admin'
														? 'bg-blue-100 text-blue-800'
														: 'bg-gray-100 text-gray-800'
												}`}
											>
												{member.role}
											</span>
										</td>
										<td className="py-4 px-6">
											{member.usage.agents}
										</td>
										<td className="py-4 px-6">
											{member.usage.calls}
										</td>
										<td className="py-4 px-6">
											{member.usage.quota}
										</td>
										<td className="py-4 px-6">
											<div className="flex items-center">
												<PieChart className="w-4 h-4 text-green-500 mr-2" />
												<div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
													<div
														className="bg-green-500 h-2 rounded-full"
														style={{
															width: `${Math.min(
																(member.usage.calls /
																	member.usage.quota) *
																	100,
																100
															)}%`,
														}}
													></div>
												</div>
												<span className="text-xs text-gray-600">
													{Math.round(
														(member.usage.calls /
															member.usage.quota) *
															100
													)}
													%
												</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Team;
