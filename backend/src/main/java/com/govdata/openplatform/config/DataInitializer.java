package com.govdata.openplatform.config;

import com.govdata.openplatform.entity.*;
import com.govdata.openplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DatasetRepository datasetRepository;
    private final DatasetFieldRepository fieldRepository;
    private final PublishWindowRepository windowRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            initUsers();
        }
        if (windowRepository.count() == 0) {
            initPublishWindows();
        }
        if (datasetRepository.count() == 0) {
            initSampleDatasets();
        }
        log.info("Data initialization completed");
    }

    private void initUsers() {
        User businessUser = new User();
        businessUser.setUsername("business");
        businessUser.setPassword("123456");
        businessUser.setRealName("张三");
        businessUser.setEmail("zhangsan@gov.cn");
        businessUser.setDepartment("统计局业务处");
        businessUser.setRole(User.Role.BUSINESS);
        userRepository.save(businessUser);

        User dataOfficeUser = new User();
        dataOfficeUser.setUsername("dataoffice");
        dataOfficeUser.setPassword("123456");
        dataOfficeUser.setRealName("李四");
        dataOfficeUser.setEmail("lisi@gov.cn");
        dataOfficeUser.setDepartment("数据管理办公室");
        dataOfficeUser.setRole(User.Role.DATA_OFFICE);
        userRepository.save(dataOfficeUser);

        User adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setPassword("123456");
        adminUser.setRealName("王五");
        adminUser.setEmail("wangwu@gov.cn");
        adminUser.setDepartment("信息化管理处");
        adminUser.setRole(User.Role.ADMIN);
        userRepository.save(adminUser);

        log.info("Initialized 3 users: business, dataoffice, admin");
    }

    private void initPublishWindows() {
        PublishWindow window1 = new PublishWindow();
        window1.setTitle("2024年第二季度常规发布窗口");
        window1.setDescription("季度常规数据发布，包含经济、人口、教育等领域数据");
        window1.setWindowStart(LocalDateTime.now().minusDays(1));
        window1.setWindowEnd(LocalDateTime.now().plusDays(7));
        window1.setStatus(PublishWindow.WindowStatus.ACTIVE);
        window1.setPublishType(PublishWindow.PublishType.ROUTINE);
        window1.setMaxDatasets(50);
        window1.setPublishedCount(3);
        windowRepository.save(window1);

        PublishWindow window2 = new PublishWindow();
        window2.setTitle("2024年第三季度常规发布窗口");
        window2.setDescription("季度常规数据发布");
        window2.setWindowStart(LocalDateTime.now().plusDays(30));
        window2.setWindowEnd(LocalDateTime.now().plusDays(37));
        window2.setStatus(PublishWindow.WindowStatus.PLANNED);
        window2.setPublishType(PublishWindow.PublishType.ROUTINE);
        window2.setMaxDatasets(50);
        window2.setPublishedCount(0);
        windowRepository.save(window2);

        PublishWindow window3 = new PublishWindow();
        window3.setTitle("应急数据发布窗口");
        window3.setDescription("突发公共事件应急数据发布");
        window3.setWindowStart(LocalDateTime.now().minusDays(3));
        window3.setWindowEnd(LocalDateTime.now().minusDays(1));
        window3.setStatus(PublishWindow.WindowStatus.CLOSED);
        window3.setPublishType(PublishWindow.PublishType.EMERGENCY);
        window3.setMaxDatasets(20);
        window3.setPublishedCount(5);
        windowRepository.save(window3);

        log.info("Initialized 3 publish windows");
    }

    private void initSampleDatasets() {
        Dataset dataset1 = new Dataset();
        dataset1.setName("全市常住人口基本信息");
        dataset1.setCode("POP-001");
        dataset1.setDescription("全市各区县常住人口统计数据，包含年龄、性别、教育程度等基本信息");
        dataset1.setCategory("人口统计");
        dataset1.setDepartment("统计局人口处");
        dataset1.setDataSource("人口普查系统");
        dataset1.setUpdateFrequency("季度");
        dataset1.setStatus(Dataset.DatasetStatus.PUBLISHED);
        dataset1.setCurrentVersion("1.2");
        dataset1.setPublishedVersion("1.0");
        dataset1.setCreatedBy("business");
        Dataset saved1 = datasetRepository.save(dataset1);

        addSampleFields(saved1, "1.0");

        Dataset dataset2 = new Dataset();
        dataset2.setName("企业法人基本信息");
        dataset2.setCode("ENT-001");
        dataset2.setDescription("全市工商注册企业基本信息，包含法人、注册资本、经营范围等");
        dataset2.setCategory("企业信息");
        dataset2.setDepartment("市场监管局");
        dataset2.setDataSource("企业信用信息公示系统");
        dataset2.setUpdateFrequency("月度");
        dataset2.setStatus(Dataset.DatasetStatus.UNDER_REVIEW);
        dataset2.setCurrentVersion("1.1");
        dataset2.setCreatedBy("business");
        Dataset saved2 = datasetRepository.save(dataset2);

        addSampleFieldsForReview(saved2, "1.1");

        Dataset dataset3 = new Dataset();
        dataset3.setName("教育资源分布统计");
        dataset3.setCode("EDU-001");
        dataset3.setDescription("全市中小学、幼儿园分布及师资力量统计数据");
        dataset3.setCategory("教育统计");
        dataset3.setDepartment("教育局");
        dataset3.setDataSource("教育管理信息系统");
        dataset3.setUpdateFrequency("年度");
        dataset3.setStatus(Dataset.DatasetStatus.DRAFT);
        dataset3.setCurrentVersion("1.0");
        dataset3.setCreatedBy("business");
        Dataset saved3 = datasetRepository.save(dataset3);

        addSampleDraftFields(saved3);

        log.info("Initialized 3 sample datasets");
    }

    private void addSampleFields(Dataset dataset, String version) {
        DatasetField field1 = new DatasetField();
        field1.setDataset(dataset);
        field1.setVersion(version);
        field1.setFieldName("区县名称");
        field1.setFieldCode("district_name");
        field1.setDataType("VARCHAR(50)");
        field1.setDescription("区县行政区划名称");
        field1.setSampleData("海淀区");
        field1.setIsSensitive(false);
        field1.setSensitivityLevel(DatasetField.SensitivityLevel.NONE);
        field1.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field1.setSortOrder(1);
        fieldRepository.save(field1);

        DatasetField field2 = new DatasetField();
        field2.setDataset(dataset);
        field2.setVersion(version);
        field2.setFieldName("常住人口数");
        field2.setFieldCode("population");
        field2.setDataType("INTEGER");
        field2.setDescription("区县常住总人口数");
        field2.setSampleData("3250000");
        field2.setIsSensitive(false);
        field2.setSensitivityLevel(DatasetField.SensitivityLevel.NONE);
        field2.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field2.setSortOrder(2);
        fieldRepository.save(field2);

        DatasetField field3 = new DatasetField();
        field3.setDataset(dataset);
        field3.setVersion(version);
        field3.setFieldName("身份证号");
        field3.setFieldCode("id_card");
        field3.setDataType("VARCHAR(18)");
        field3.setDescription("居民身份证号码");
        field3.setSampleData("110***********1234");
        field3.setIsSensitive(true);
        field3.setSensitivityLevel(DatasetField.SensitivityLevel.HIGH);
        field3.setDesensitizationType(DatasetField.DesensitizationType.MASKING);
        field3.setDesensitizationRule("前3位后4位显示，中间用*代替");
        field3.setSortOrder(3);
        fieldRepository.save(field3);

        DatasetField field4 = new DatasetField();
        field4.setDataset(dataset);
        field4.setVersion(version);
        field4.setFieldName("手机号码");
        field4.setFieldCode("phone");
        field4.setDataType("VARCHAR(11)");
        field4.setDescription("联系电话号码");
        field4.setSampleData("138****1234");
        field4.setIsSensitive(true);
        field4.setSensitivityLevel(DatasetField.SensitivityLevel.MEDIUM);
        field4.setDesensitizationType(DatasetField.DesensitizationType.MASKING);
        field4.setDesensitizationRule("前3位后4位显示，中间用*代替");
        field4.setSortOrder(4);
        fieldRepository.save(field4);

        DatasetField field5 = new DatasetField();
        field5.setDataset(dataset);
        field5.setVersion(version);
        field5.setFieldName("家庭住址");
        field5.setFieldCode("address");
        field5.setDataType("VARCHAR(200)");
        field5.setDescription("家庭详细住址");
        field5.setSampleData("北京市海淀区***街道***小区");
        field5.setIsSensitive(true);
        field5.setSensitivityLevel(DatasetField.SensitivityLevel.HIGH);
        field5.setDesensitizationType(DatasetField.DesensitizationType.REPLACEMENT);
        field5.setDesensitizationRule("仅保留区县一级信息");
        field5.setSortOrder(5);
        fieldRepository.save(field5);
    }

    private void addSampleFieldsForReview(Dataset dataset, String version) {
        DatasetField field1 = new DatasetField();
        field1.setDataset(dataset);
        field1.setVersion(version);
        field1.setFieldName("企业名称");
        field1.setFieldCode("company_name");
        field1.setDataType("VARCHAR(200)");
        field1.setDescription("企业工商注册名称");
        field1.setSampleData("某某科技有限公司");
        field1.setIsSensitive(false);
        field1.setSensitivityLevel(DatasetField.SensitivityLevel.NONE);
        field1.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field1.setSortOrder(1);
        fieldRepository.save(field1);

        DatasetField field2 = new DatasetField();
        field2.setDataset(dataset);
        field2.setVersion(version);
        field2.setFieldName("统一社会信用代码");
        field2.setFieldCode("credit_code");
        field2.setDataType("VARCHAR(18)");
        field2.setDescription("企业统一社会信用代码");
        field2.setSampleData("91110000XXXXXXXXXX");
        field2.setIsSensitive(false);
        field2.setSensitivityLevel(DatasetField.SensitivityLevel.LOW);
        field2.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field2.setSortOrder(2);
        fieldRepository.save(field2);

        DatasetField field3 = new DatasetField();
        field3.setDataset(dataset);
        field3.setVersion(version);
        field3.setFieldName("法定代表人");
        field3.setFieldCode("legal_representative");
        field3.setDataType("VARCHAR(50)");
        field3.setDescription("企业法定代表人姓名");
        field3.setSampleData("张*");
        field3.setIsSensitive(true);
        field3.setSensitivityLevel(DatasetField.SensitivityLevel.MEDIUM);
        field3.setDesensitizationType(DatasetField.DesensitizationType.MASKING);
        field3.setDesensitizationRule("姓氏保留，名字用*代替");
        field3.setSortOrder(3);
        fieldRepository.save(field3);

        DatasetField field4 = new DatasetField();
        field4.setDataset(dataset);
        field4.setVersion(version);
        field4.setFieldName("注册资本");
        field4.setFieldCode("registered_capital");
        field4.setDataType("DECIMAL(18,2)");
        field4.setDescription("企业注册资本（万元）");
        field4.setSampleData("500.00");
        field4.setIsSensitive(false);
        field4.setSensitivityLevel(DatasetField.SensitivityLevel.NONE);
        field4.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field4.setSortOrder(4);
        fieldRepository.save(field4);
    }

    private void addSampleDraftFields(Dataset dataset) {
        DatasetField field1 = new DatasetField();
        field1.setDataset(dataset);
        field1.setVersion("1.0");
        field1.setFieldName("学校名称");
        field1.setFieldCode("school_name");
        field1.setDataType("VARCHAR(100)");
        field1.setDescription("学校全称");
        field1.setSampleData("北京市第一中学");
        field1.setIsSensitive(false);
        field1.setSensitivityLevel(DatasetField.SensitivityLevel.NONE);
        field1.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field1.setSortOrder(1);
        fieldRepository.save(field1);

        DatasetField field2 = new DatasetField();
        field2.setDataset(dataset);
        field2.setVersion("1.0");
        field2.setFieldName("在校学生数");
        field2.setFieldCode("student_count");
        field2.setDataType("INTEGER");
        field2.setDescription("在校学生总数");
        field2.setSampleData("2500");
        field2.setIsSensitive(false);
        field2.setSensitivityLevel(DatasetField.SensitivityLevel.NONE);
        field2.setDesensitizationType(DatasetField.DesensitizationType.NONE);
        field2.setSortOrder(2);
        fieldRepository.save(field2);

        DatasetField field3 = new DatasetField();
        field3.setDataset(dataset);
        field3.setVersion("1.0");
        field3.setFieldName("校长姓名");
        field3.setFieldCode("principal_name");
        field3.setDataType("VARCHAR(50)");
        field3.setDescription("学校校长姓名");
        field3.setSampleData("");
        field3.setIsSensitive(false);
        field3.setSensitivityLevel(null);
        field3.setDesensitizationType(null);
        field3.setSortOrder(3);
        fieldRepository.save(field3);
    }
}
