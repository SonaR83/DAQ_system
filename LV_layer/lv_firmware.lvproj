<?xml version='1.0' encoding='UTF-8'?>
<Project Type="Project" LVVersion="25008000">
	<Item Name="My Computer" Type="My Computer">
		<Property Name="NI.SortType" Type="Int">3</Property>
		<Property Name="server.app.propertiesEnabled" Type="Bool">true</Property>
		<Property Name="server.control.propertiesEnabled" Type="Bool">true</Property>
		<Property Name="server.tcp.enabled" Type="Bool">false</Property>
		<Property Name="server.tcp.port" Type="Int">0</Property>
		<Property Name="server.tcp.serviceName" Type="Str">My Computer/VI Server</Property>
		<Property Name="server.tcp.serviceName.default" Type="Str">My Computer/VI Server</Property>
		<Property Name="server.vi.callsEnabled" Type="Bool">true</Property>
		<Property Name="server.vi.propertiesEnabled" Type="Bool">true</Property>
		<Property Name="specify.custom.address" Type="Bool">false</Property>
		<Item Name="Interfaces" Type="Folder">
			<Item Name="Send Notification" Type="Folder">
				<Item Name="Messages" Type="Folder">
					<Item Name="send response Msg.lvclass" Type="LVClass" URL="../Send Notification Messages/send response Msg/send response Msg.lvclass"/>
				</Item>
				<Item Name="Send Notification.lvclass" Type="LVClass" URL="../Send Notification/Send Notification.lvclass"/>
			</Item>
			<Item Name="Udate Nested Attributes" Type="Folder">
				<Property Name="NI.SortType" Type="Int">3</Property>
				<Item Name="update_attrs Msg.lvclass" Type="LVClass" URL="../Udate Nested Attributes Messages/update_attrs Msg/update_attrs Msg.lvclass"/>
				<Item Name="Udate Nested Attributes.lvclass" Type="LVClass" URL="../Udate Nested Attributes/Udate Nested Attributes.lvclass"/>
			</Item>
		</Item>
		<Item Name="root_actor.lvlib" Type="Library" URL="../root_actor/root_actor.lvlib"/>
		<Item Name="command_parser.lvlib" Type="Library" URL="../command_parser/command_parser.lvlib"/>
		<Item Name="UDP_receiver.lvlib" Type="Library" URL="../UDP_receiver/UDP_receiver.lvlib"/>
		<Item Name="UDP_transmitter.lvlib" Type="Library" URL="../UDP_transmitter/UDP_transmitter.lvlib"/>
		<Item Name="DAQVoltage.lvlib" Type="Library" URL="../DAQVoltage/DAQVoltage.lvlib"/>
		<Item Name="launcher.vi" Type="VI" URL="../launcher.vi"/>
		<Item Name="Dependencies" Type="Dependencies"/>
		<Item Name="Build Specifications" Type="Build"/>
	</Item>
</Project>
